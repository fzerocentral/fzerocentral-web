import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class FiltersEditRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filter: this.store.findRecord('filter', params.filter_id),
    });
  }
}
