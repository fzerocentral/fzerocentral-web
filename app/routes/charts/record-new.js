import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { FilterSelectControl } from '../../utils/filter-select';

export default class ChartsRecordNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      players: this.store.query('player', { 'page[size]': 1000 }),
      filterGroups: this.store.query('filterGroup', {
        chart_id: params.chart_id,
      }),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    resolvedModel.filterGroups.forEach((filterGroup) => {
      // Set up filter-select control instance for this filter group.
      let initialFilter = null;
      if (resolvedModel.record) {
        // Editing an existing record; initial value is the record's
        // existing filter, if any.
        initialFilter = resolvedModel.record.filters.find(
          (filter) => filter.filterGroup.get('id') === filterGroup.id
        );
      }

      let filterSelect = new FilterSelectControl(
        `filter-${filterGroup.id}`,
        // Partial-apply filterGroup.id to this action method.
        controller.getFilterOptionsForGroup.bind(null, filterGroup.id),
        { hasEmptyOption: true, initialFilter: initialFilter }
      );

      filterSelect.initializeOptions();
      controller.filterSelects[filterGroup.id] = filterSelect;
    });
  }
}
