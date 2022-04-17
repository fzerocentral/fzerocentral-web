import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';


export default class FilterGroupsFilterNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filterGroup: this.store.findRecord(
        'filter-group', params.filter_group_id),
    });
  }
}
