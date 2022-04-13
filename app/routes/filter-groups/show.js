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
    };

    return RSVP.hash(modelHash);
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
