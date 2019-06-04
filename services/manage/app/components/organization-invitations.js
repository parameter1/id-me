import Component from '@ember/component';

export default Component.extend({
  classNames: ['card', 'mb-3'],
  isInviteOpen: false,

  actions: {
    showInviteModal() {
      this.set('isInviteOpen', true);
    }
  },
});
