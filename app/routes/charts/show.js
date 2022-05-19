import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { LadderAndFilterControlsManager } from '../../components/ladder-and-filter-controls';
import { filterSpecStrToItems } from '../../utils/filter-specs';

export default class ChartsShowRoute extends Route {
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
      ladder: this.store.findRecord('ladder', params.ladderId, {
        include: 'game',
      }),
      ladderFilterObjs: this.store.query('filter', {
        ladder_id: params.ladderId,
      }),

      ladderCharts: this.store.query('chart', {
        ladder_id: params.ladderId,
        fields: 'name,chart_group',
        // Include some chart group details to avoid extra queries.
        include: 'chart_group',
        'page[size]': 1000,
      }),
      records: this.nonEmberDataApi.getChartRanking(
        params.chart_id,
        params.ladderId,
        params.extraFiltersString
      ),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);
    let currentChart = resolvedModel.chart;

    // Chart navigation

    if (resolvedModel.chart.chartGroup.get('showChartsTogether')) {
      // Chart navigation primarily goes from one leaf chart group to another.
      // 'Leaf' chart groups sit directly above charts, not above other
      // chart groups. (Term refers to a computer-science tree's leaf nodes)
      let ladderLeafGroups = [];
      let currentCgCharts = [];
      let currentCgOtherCharts = [];
      let currentCgIndex;
      let lastGroupId = null;
      let leafGroupHash;
      resolvedModel.ladderCharts.forEach((chart) => {
        let groupId = chart.chartGroup.get('id');
        if (groupId !== lastGroupId) {
          leafGroupHash = {
            group: chart.chartGroup,
            // Corresponding chart is the chart of this group that
            // has the same name as the current chart. Or if no such chart
            // is found, we use the first chart of the group (as set here).
            correspondingChart: chart,
          };
          ladderLeafGroups.push(leafGroupHash);
          lastGroupId = groupId;
        }

        if (chart.name === currentChart.name) {
          // This is the corresponding chart.
          leafGroupHash.correspondingChart = chart;
        }

        if (groupId === currentChart.chartGroup.get('id')) {
          currentCgCharts.push(chart);
          if (chart.id !== currentChart.id) {
            currentCgOtherCharts.push(chart);
          }
          currentCgIndex = ladderLeafGroups.length - 1;
        }
      });

      controller.chartNavigationChoices = ladderLeafGroups.map((hash) => {
        return {
          chart: hash.correspondingChart,
          display: hash.group.get('name'),
        };
      });
      if (currentCgIndex > 0) {
        controller.chartNavigationPrevious =
          controller.chartNavigationChoices[currentCgIndex - 1];
      }
      if (currentCgIndex < ladderLeafGroups.length - 1) {
        controller.chartNavigationNext =
          controller.chartNavigationChoices[currentCgIndex + 1];
      }
      controller.currentCgCharts = currentCgCharts;
      controller.currentCgOtherCharts = currentCgOtherCharts;
    } else {
      // Chart navigation treats charts individually, ignoring groups.
      let ladderCharts = [];
      let currentChartIndex;
      resolvedModel.ladderCharts.forEach((chart) => {
        ladderCharts.push(chart);

        if (chart.id === currentChart.id) {
          currentChartIndex = ladderCharts.length - 1;
        }
      });

      controller.chartNavigationChoices = ladderCharts.map((chart) => {
        return {
          chart: chart,
          display: `${chart.chartGroup.get('name')} - ${chart.name}`,
        };
      });
      if (currentChartIndex > 0) {
        controller.chartNavigationPrevious =
          controller.chartNavigationChoices[currentChartIndex - 1];
      }
      if (currentChartIndex < ladderCharts.length - 1) {
        controller.chartNavigationNext =
          controller.chartNavigationChoices[currentChartIndex + 1];
      }
    }

    // Other records in the same chart group

    let modelParams = this.paramsFor(this.routeName);

    if (resolvedModel.chart.chartGroup.get('showChartsTogether')) {
      this.nonEmberDataApi
        .getChartOtherRecords(
          currentChart.id,
          modelParams.ladderId,
          modelParams.extraFiltersString
        )
        .then((results) => {
          controller.otherRecords = results;
        });
    }

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
