import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class FilterGroupsShowRoute extends Route {
  @service store;

  // TODO:
  // 1. These really don't have to be query params, but how to change it?
  // 2. Make these values reset for the next visit to this page
  // 3. At least standardize the naming format (snake_case vs. camelCase)
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

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    controller.newImplicationTargetOptions = this.store.query(
      'filter', {filter_group_id: resolvedModel.filterGroup.id});
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
