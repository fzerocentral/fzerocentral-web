import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class LaddersChartsRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  model(params) {
    let ladderPromise = this.store.findRecord('ladder', params.ladder_id, {
      // This seems like a totally unnecessary include,
      // but it seems to be needed to even get the chart group ID.
      include: 'chart_group',
    });

    return RSVP.hash({
      chartHierarchy: ladderPromise.then((ladder) => {
        let chartGroupId = ladder.chartGroup.get('id');
        return this.nonEmberDataApi.getChartHierarchy(chartGroupId);
      }),
      ladder: ladderPromise,
    });
  }
}
