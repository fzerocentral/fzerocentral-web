import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { LadderAndFilterControlsManager } from '../../components/ladder-and-filter-controls';
import { filterSpecStrToItems } from '../../utils/filter-specs';

export default class ChartsPlayerHistoryRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    // Re-run the model hook if these query params change.
    extraFiltersString: { refreshModel: true },
    ladderId: { refreshModel: true },
  };

  model(params) {
    let items = filterSpecStrToItems(params.extraFiltersString);
    let extraFilterIds = items.map((item) => item.filterId);

    return RSVP.hash({
      extraFilterObjs: this.store.query('filter', {
        filter_ids: extraFilterIds.join(','),
      }),
      chart: this.store.findRecord('chart', params.chart_id),
      chartLadders: this.store.query('ladder', { chart_id: params.chart_id }),
      filterGroups: this.store.query('filter-group', {
        chart_id: params.chart_id,
      }),
      ladder: this.store.findRecord('ladder', params.ladderId),
      ladderFilterObjs: this.store.query('filter', {
        ladder_id: params.ladderId,
      }),

      player: this.store.findRecord('player', params.player_id),
      records: this.nonEmberDataApi.getChartPlayerHistory(
        params.chart_id,
        params.player_id,
        params.ladderId,
        params.extraFiltersString
      ),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    // Controls component

    controller.ladderAndFilterControls = new LadderAndFilterControlsManager(
      resolvedModel.ladder,
      resolvedModel.ladderFilterObjs,
      resolvedModel.chartLadders,
      controller.updateLadderId,
      resolvedModel.filterGroups,
      resolvedModel.extraFilterObjs,
      controller.updateExtraFiltersString
    );
  }
}
