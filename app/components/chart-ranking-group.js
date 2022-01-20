import { A } from '@ember/array';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  chartGroup: null,
  mainChartIdQueryArg: null,

  @computed('chartGroup.charts')
  get charts() {
    let charts = this.get('chartGroup').get('charts');
    if (charts === undefined) {
      return A([]);
    }
    else {
      return charts;
    }
  },

  @computed('charts', 'mainChartIdQueryArg')
  get mainChartId() {
    if (this.get('mainChartIdQueryArg')) {
      // Main chart has been specified.
      return this.get('mainChartIdQueryArg');
    }

    if (this.get('charts').length > 0) {
      // Main chart has not been specified, so use the first chart.
      return this.get('charts').objectAt(0).get('id');
    }

    // No charts specified yet, so all we can return is null.
    return null;
  },

  @computed('charts', 'mainChartId')
  get mainChart() {
    if (this.get('mainChartId') === null) {
      return null;
    }

    return this.get('charts').findBy('id', this.get('mainChartId'));
  },

  // Array of charts other than the mainChart.
  @computed('charts', 'mainChartId')
  get otherCharts() {
    let notMainChart = (chart) => {
      return chart.id !== this.get('mainChartId');
    };
    return this.get('charts').filter(notMainChart);
  },
});
