import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';


export default class FiltersAddImplicationRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filter: this.store.findRecord('filter', params.filter_id),
      alreadyImpliedFilters: this.store.query('filter', {
        implied_by_filter_id: params.filter_id,
      }),
    });
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    // Set searchEnabled based on number of implied filters available
    let promise = controller.getImpliedTypeFilters('');
    promise.then((filters) => {
      controller.filterSelect.searchEnabled = (
        filters.meta.pagination.pages > 1);
    })
    // Initialize options
    controller.filterSelect.updateOptions('');
  }
}
