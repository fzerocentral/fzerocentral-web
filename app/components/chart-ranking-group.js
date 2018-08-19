import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    // All charts in this chart group
    // TODO: During testing only, this gets only one chart in cases when it
    // should get multiple. Don't know why.
    let groupCharts = this.mainChart.get('chartGroup').get('charts');
    // groupCharts other than mainChart (mainChart is the chart we're ranking
    // records by)
    let otherCharts = [];
    // Records for mainChart
    let mainChartRecords = null;
    // Records for otherCharts
    let otherChartRecords = {};
    // Promises to fetch the records and assign them to the variables above
    let recordFetchHandlerPromises = [];

    groupCharts.forEach((chart) => {
      // Call API to get this chart's records
      let recordFetchPromise = this.get('store').query('record', {chart_id: chart.id});

      if (chart.id === this.mainChart.get('id')) {
        recordFetchHandlerPromises.push(
          recordFetchPromise.then((chartRecords) => {
            // mainChartRecords is essentially just an array of records,
            // already in rank-order from the API
            mainChartRecords = chartRecords;
            return true;
          })
        );
      }
      else {
        otherCharts.push(chart);
        otherChartRecords[chart.id] = {};

        recordFetchHandlerPromises.push(
          recordFetchPromise.then((chartRecords) => {
            // otherChartRecords is a 2D hash structure, hashing first by
            // chart ID, then by user ID. This makes it easy to pick out the
            // records we want when iterating over the ranking-table rows
            chartRecords.forEach((record) => {
              otherChartRecords[record.get('chart').content.id][record.get('user').content.id] = record;
            });
            return true;
          })
        );
      }
    });

    // The component template needs this
    this.set('otherCharts', otherCharts);

    Promise.all(recordFetchHandlerPromises).then(() => {
      // The component template should be able to iterate over this to fill in
      // the records table row by row
      let recordRows = [];

      mainChartRecords.forEach((mainRecord) => {
        let otherRecords = [];
        otherCharts.forEach((chart) => {
          let userId = mainRecord.get('user').content.id;
          if (otherChartRecords[chart.id].hasOwnProperty(userId)) {
            otherRecords.push(otherChartRecords[chart.id][userId]);
          }
          else {
            otherRecords.push(null);
          }
        });

        recordRows.push({
          mainRecord: mainRecord,
          otherRecords: otherRecords,
        });
      });

      // Ember beginner note: If `recordRows` is in the template, don't use
      // `this.recordRows` in this JS hook in any way. Otherwise the behavior
      // may be confusing.
      this.set('recordRows', recordRows);
    });
  },
});
