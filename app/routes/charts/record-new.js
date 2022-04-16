import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { FilterSelectControl } from "../../components/filter-select";


export default class ChartsRecordNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      players: this.store.query('player', {'page[size]': 1000}),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    resolvedModel.filterGroups.forEach((filterGroup) => {
      // Set up filter-select control instance for this filter group.
      let filterSelect = new FilterSelectControl(
        controller.formId,
        `filter-${filterGroup.id}`,
        // Partial-apply filterGroup.id to this action method.
        controller.getFilterOptionsForGroup.bind(null, filterGroup.id),
      );
      // Initialize options.
      let promise = filterSelect.updateOptions();
      // Set searchEnabled based on number of filters available.
      promise.then((filters) => {
        filterSelect.searchEnabled = (
          filters.meta.pagination.pages > 1);
      })
      controller.filterSelects[filterGroup.id] = filterSelect;

      // Initialize filter choices (for record editing only).
      if (resolvedModel.record) {
        controller.selectedFiltersByGroup[filterGroup.id] =
          resolvedModel.record.filters.find(
            (filter) => filter.filterGroup.get('id') === filterGroup.id);
      }
    });
  }
}
