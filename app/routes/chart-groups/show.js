import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartGroupsShowRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    mainChartId: {
      // Re-run the model hook if this query param changes.
      // In particular, we need the recordRows to refresh.
      refreshModel: true
    }
  };

  model(params) {
    return RSVP.hash({
      chartGroup: this.store.findRecord('chart-group', params.chart_group_id),
      recordRows: this.nonEmberDataApi.getChartGroupRanking(
        params.chart_group_id, params.mainChartId, null),
    });
  }
}
