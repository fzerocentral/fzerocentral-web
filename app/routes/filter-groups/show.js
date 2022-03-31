import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class FilterGroupsShowRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    choosable_filters_name_search: {refreshModel: true},
    choosable_filters_page: {refreshModel: true},
    implied_filters_name_search: {refreshModel: true},
    implied_filters_page: {refreshModel: true},
    incomingImplicationsPageNumber: {refreshModel: true},
    outgoingImplicationsPageNumber: {refreshModel: true},
    selectedFilterId: {refreshModel: true},
  };

  model(params) {
    let modelHash = {
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

      incomingImplications: null,
      outgoingImplications: null,
      sampleRecordsOfFilter: null,
      selectedFilter: null,
    };

    if (params.selectedFilterId !== null) {
      modelHash = {...modelHash, ...{
        incomingImplications: this.store.query('filter', {
          implies_filter_id: params.selectedFilterId,
          'page[number]': params.incomingImplicationsPageNumber,
        }),
        outgoingImplications: this.store.query('filter', {
          implied_by_filter_id: params.selectedFilterId,
          'page[number]': params.outgoingImplicationsPageNumber,
        }),
        sampleRecordsOfFilter: this.store.query(
          'record', {filters: params.selectedFilterId, 'page[size]': 1}),
        selectedFilter: this.store.findRecord(
          'filter', params.selectedFilterId),
      }};
    }

    return RSVP.hash(modelHash);
  }

  @action
  refreshModel() {
    this.refresh();
  }

  // TODO: Check if needed
  // @action
  // willTransition() {
  //   // Reset state, else it will persist until the next time we go
  //   // to this route
  //   this.controllerFor(this.routeName).set('selectedFilterId', null);
  // }
}
