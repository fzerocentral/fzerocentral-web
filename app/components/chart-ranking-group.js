import { A } from '@ember/array';
import Component from '@glimmer/component';

export default class ChartRankingGroupComponent extends Component {

  get charts() {
    let charts = this.args.chartGroup.get('charts');
    if (charts === undefined) {
      return A([]);
    }
    else {
      return charts;
    }
  }

  get mainChartId() {
    if (this.args.mainChartIdQueryArg) {
      // Main chart has been specified.
      return this.args.mainChartIdQueryArg;
    }

    if (this.charts.length > 0) {
      // Main chart has not been specified, so use the first chart.
      return this.charts.objectAt(0).id;
    }

    // No charts specified yet, so all we can return is null.
    return null;
  }

  get mainChart() {
    if (this.mainChartId === null) {
      return null;
    }

    return this.charts.findBy('id', this.mainChartId);
  }

  // Array of charts other than the mainChart.
  get otherCharts() {
    let notMainChart = (chart) => {
      return chart.id !== this.mainChartId;
    };
    return this.charts.filter(notMainChart);
  }
}
