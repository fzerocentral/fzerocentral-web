import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import {
  LadderAndFilterControlsManager
} from "../../components/ladder-and-filter-controls";
import { filterSpecStrToItems } from "../../utils/filter-specs";


export default class ChartsTopRecordHistoryRoute extends Route {
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
      appliedFilterObjs: this.store.query(
        'filter', {filter_ids: appliedFilterIds.join(',')}),
      chart: this.store.findRecord('chart', params.chart_id),
      chartLadders: this.store.query(
        'ladder', {chart_id: params.chart_id}),
      filterGroups: this.store.query(
        'filter-group', {chart_id: params.chart_id}),
      ladder: this.store.findRecord('ladder', params.ladderId),
      ladderFilterObjs: this.store.query(
        'filter', {ladder_id: params.ladderId}),

      records: this.nonEmberDataApi.getChartTopRecordHistory(
        params.chart_id, params.ladderId, params.appliedFiltersString),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    // Controls component

    let modelParams = this.paramsFor(this.routeName);
    controller.ladderAndFilterControls = new LadderAndFilterControlsManager(
      resolvedModel.ladder,
      resolvedModel.ladderFilterObjs,
      resolvedModel.chartLadders,
      controller.updateLadderId,
      modelParams.appliedFiltersString,
      resolvedModel.filterGroups,
      resolvedModel.appliedFilterObjs,
      controller.getFilterOptions,
      controller.updateAppliedFiltersString,
    );
  }
}
