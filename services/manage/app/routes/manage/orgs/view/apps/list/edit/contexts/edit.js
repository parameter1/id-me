import Route from '@ember/routing/route';
import { RouteQueryManager } from 'ember-apollo-client';

export default Route.extend(RouteQueryManager, {
  model({ context_id: id }) {
    return { id };
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('application', this.modelFor('manage.orgs.view.apps.list.edit'));
  },
});
