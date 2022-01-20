import { A } from '@ember/array';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class FilterGroupsShowRoute extends Route {
  @service store;

  queryParams = {
    choosable_filters_name_search: {refreshModel: true},
    choosable_filters_page: {refreshModel: true},
    implied_filters_name_search: {refreshModel: true},
    implied_filters_page: {refreshModel: true},
  };

  model(params) {
    return RSVP.hash({
      chartTypes: this.store.query(
        'chart-type', {filter_group_id: params.filter_group_id}),
      filterGroup: this.store.findRecord(
        'filter-group', params.filter_group_id),
      filtersChoosable: this.store.query('filter', {
        filter_group_id: params.filter_group_id,
        name_search: params.choosable_filters_name_search,
        'page[number]': params.choosable_filters_page,
        usage_type: 'choosable',
      }),
      filtersImplied: this.store.query('filter', {
        filter_group_id: params.filter_group_id,
        name_search: params.implied_filters_name_search,
        'page[number]': params.implied_filters_page,
        usage_type: 'implied',
      }),
      newFilter: this.store.createRecord('filter'),
    });
  }

  @action
  createFilter() {
    let newFilter = this.modelFor(this.routeName).newFilter;
    newFilter.set('filterGroup', this.modelFor(this.routeName).filterGroup);

    // Save the filter
    newFilter.save().then(() => {
      // Success callback
      this.controllerFor(this.routeName).set('filterCreateError', null);

      // Refresh the model to reset newFilter.
      this.refresh();
    }, (response) => {
      // Error callback
      this.controllerFor(this.routeName).set(
        'filterCreateError', response.errors[0]);
    });
  }

  @action
  willTransition() {
    // rollbackAttributes() removes the record from the store
    // if the model 'isNew'
    this.modelFor(this.routeName).newFilter.rollbackAttributes();
    // Reset state, else it will persist until the next time we go
    // to this route
    this.controllerFor(this.routeName).set('filterCreateError', null);
    this.controllerFor(this.routeName).set('selectedFilterId', null);
  }
}
