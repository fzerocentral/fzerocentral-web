import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { filterSpecStrToItems } from "../../utils/filter-specs";


export default class ChartsShowRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    // Re-run the model hook if these query params change.
    appliedFiltersString: {refreshModel: true},
    ladderId: {refreshModel: true},
  };

  model(params) {
    let items = filterSpecStrToItems(params.appliedFiltersString);
    let appliedFilterIds = items.map(item => item.filterId);

    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      chartLadders: this.store.query(
        'ladder', {chart_id: params.chart_id}),
      ladderCharts: this.store.query(
        'chart', {
          ladder_id: params.ladderId,
          // Include some chart group details to avoid extra queries.
          include: 'chart_group',
          'page[size]': 1000,
        }),

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
