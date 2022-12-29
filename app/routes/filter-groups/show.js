import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FilterGroupsShowRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chartTypes: this.store.query('chart-type', {
        filter_group_id: params.filter_group_id,
      }),
      filterGroup: this.store.findRecord(
        'filter-group',
        params.filter_group_id,
        // Include game details to avoid extra queries.
        { include: 'game' }
      ),
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    // Initialize filter lists
    controller.updateChoosableFilters();
    controller.updateImpliedFilters();
  }
}
