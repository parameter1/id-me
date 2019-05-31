const {
  findById,
  find,
  listForOrg,
  updateField,
  updateMany,
} = require('@base-cms/id-me-utils').actions;

const Application = require('../mongodb/models/application');

const accessLevel = require('./access-level');
const create = require('./create');
const team = require('./team');

const { keys } = Object;

const load = (root, obj) => keys(obj).reduce((o, key) => {
  const k = `${root}.${key}`;
  return { ...o, [k]: obj[key] };
}, {});

module.exports = {
  ...load('access-level', accessLevel),
  ...load('team', team),
  create,
  find: params => find(Application, params),
  findById: params => findById(Application, params),
  listForOrg: params => listForOrg(Application, params),
  updateField: params => updateField(Application, params),
  updateMany: params => updateMany(Application, params),
};
