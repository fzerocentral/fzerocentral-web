import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GamesChartsRoute extends Route {
  @service store;

  model(params) {
    let chartGroupsPromise = this.store.query('chart-group', {
      game_code: params.game_code,
      fields: 'id,name,parent_group,order_in_parent,show_charts_together',
      'page[size]': 1000,
    });
    let chartsPromise = this.store.query('chart', {
      game_code: params.game_code,
      'page[size]': 1000,
    });

    return RSVP.hash({
      chartGroups: chartGroupsPromise,
      charts: chartsPromise,
      chartHierarchy: this.makeChartHierarchy(
        chartGroupsPromise,
        chartsPromise,
        null
      ),
      chartTags: this.store.query('chart-tag', {
        game_code: params.game_code,
        'page[size]': 1000,
      }),
      chartTypes: this.store.query('chart-type', {
        game_code: params.game_code,
        'page[size]': 1000,
      }),
      game: getGameByShortCode(this.store, params.game_code),
    });
  }

  makeChartHierarchy(chartGroupsPromise, chartsPromise, root) {
    return Promise.all([chartGroupsPromise, chartsPromise]).then(
      ([chartGroupsResult, chartsResult]) => {
        let chartGroups = chartGroupsResult.toArray();
        let charts = chartsResult.toArray();

        function visitChartGroup(chartGroup) {
          let hierarchy = [];
          let childGroups;
          if (chartGroup === null) {
            childGroups = chartGroups.filter(
              // Must access `content` to check if null, since parentGroup
              // is an ObjectProxy.
              (cg) => cg.parentGroup.content === null
            );
          } else {
            childGroups = chartGroups.filter(
              (cg) => cg.parentGroup.get('id') === chartGroup.id
            );
          }

          if (childGroups.length > 0) {
            childGroups.sort((a, b) => a.orderInParent - b.orderInParent);
            for (let childGroup of childGroups) {
              hierarchy.push({
                chartGroup: childGroup,
                children: visitChartGroup(childGroup),
              });
            }
          } else {
            let childCharts = charts.filter(
              (c) => c.chartGroup.get('id') === chartGroup.id
            );
            childCharts.sort((a, b) => a.orderInGroup - b.orderInGroup);
            for (let chart of childCharts) {
              hierarchy.push({
                chart: chart,
              });
            }
          }
          return hierarchy;
        }

        return visitChartGroup(root);
      }
    );
  }
}
