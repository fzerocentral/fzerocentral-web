import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartsShowRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    appliedFiltersString: {
      // Re-run the model hook if this query param changes.
      // In particular, we need the records to refresh when the filters change.
      refreshModel: true
    }
  };

  model(params) {
    // Get the filter IDs from the applied filters string.
    // split() example: 4-8n-90ge -> ['4', '8', '90', '']
    // filter() example: ['4', '8', '90', ''] -> ['4', '8', '90']
    let appliedFilterIds = [];
    if (params.appliedFiltersString !== null) {
      appliedFilterIds = params.appliedFiltersString
        .split(/\D+/).filter(s => s !== '');
    }

    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      ladderCharts: this.store.query(
        'chart', {ladder_id: params.ladderId, 'page[size]': 1000}),

      appliedFilterObjs: this.store.query(
        'filter', {filter_ids: appliedFilterIds.join(',')}),
      filterGroups: this.store.query(
        'filter-group', {chart_id: params.chart_id}),
      ladder: this.store.findRecord('ladder', params.ladderId),
      ladderFilterObjs: this.store.query(
        'filter', {ladder_id: params.ladderId}),
      records: this.nonEmberDataApi.getChartRanking(
        params.chart_id, params.ladderId, params.appliedFiltersString),
    });
  }
}
