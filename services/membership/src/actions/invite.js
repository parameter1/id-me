const {
  mailerService,
  orgService,
  tokenService,
  userService,
} = require('@base-cms/id-me-service-clients');
const { createError } = require('micro');
const { createLoginToken } = require('@base-cms/id-me-utils');
const { createRequiredParamError } = require('@base-cms/micro').service;

const { OrgMembership, OrgInvitation } = require('../mongodb/models');
const { APPLICATION_URL } = require('../env');

const createInvite = async ({ email, organizationId, role }) => {
  const invite = new OrgInvitation({ email, organizationId, role });
  await invite.validate();
  const obj = invite.toObject();
  delete obj._id;
  return obj;
};

module.exports = async ({
  organizationId,
  email,
  role,
} = {}) => {
  if (!organizationId) throw createRequiredParamError('organizationId');
  if (!email) throw createRequiredParamError('email');

  const [org, membership, user] = await Promise.all([
    orgService.request('findById', { id: organizationId, fields: ['id', 'name'] }),
    OrgMembership.findFor(organizationId, email, ['id']),
    userService.request('create', { email, fields: ['id', 'email'] }),
  ]);

  if (!org) throw createError(404, `No organization was found for '${organizationId}'`);
  if (membership) throw createError(400, `This user is already a member of ${org.name}.`);

  const ttl = 60 * 60 * 24 * 30;
  const query = { email: user.email, organizationId };
  const invite = await createInvite({ ...query, role });
  const { token } = await createLoginToken(tokenService, { email: user.email, ttl });
  await OrgInvitation.update(query, { $set: invite }, { upsert: true });

  const url = `${APPLICATION_URL}/authenticate/${token}?route=manage.orgs.invites`;
  const html = `
    <html>
      <body>
        <h1>You've been invited to join an organization on IdentityX.</h1>
        <h2>${org.name}</h2>
        <p><a href="${url}">View Invitation.</a></p>
      </body>
    </html>
  `;
  await mailerService.request('send', {
    to: user.email,
    from: 'IdentityX <noreply@identity-x.base-cms.io>',
    subject: `You've been invited to join ${org.name}`,
    html,
  });
  return 'ok';
};
