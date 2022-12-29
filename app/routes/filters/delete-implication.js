import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FiltersDeleteImplicationRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filter: this.store.findRecord('filter', params.filter_id),
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.filterSelect.initializeOptions();
  }
}
