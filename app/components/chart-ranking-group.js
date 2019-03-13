import Component from '@ember/component';
import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  chartGroup: null,
  mainChart: null,
  store: service('store'),

  // Array of charts other than the mainChart.
  otherCharts: computed('chartGroup', 'mainChart', function() {
    let notMainChart = (chart) => {
      return chart.id !== this.get('mainChart').get('id');
    };
    return this.get('chartGroup').get('charts').filter(notMainChart);
  }),

  // Object mapping each chart ID of this group to an array of records,
  // as a sorted ranking.
  records: computed('chartGroup', function() {
    let chartRecordsPromises = [];
    this.get('chartGroup').get('charts').forEach((chart) => {
      // Call API to get this chart's records
      let chartId = chart.get('id');
      let args = {chart_id: chartId, sort: 'value', ranked_entity: 'user'};
      let chartRecordsPromise = this.get('store').query('record', args).then(
        (chartRecords) => {return [chartId, chartRecords];}
      )
      chartRecordsPromises.push(chartRecordsPromise);
    });

    return DS.PromiseObject.create({
      promise: Promise.all(chartRecordsPromises).then((promiseResults) => {
        let recordsByChartId = EmberObject.create();
        promiseResults.forEach((chartRecordsPromiseResult) => {
          let chartId = chartRecordsPromiseResult[0];
          let chartRecords = chartRecordsPromiseResult[1];
          recordsByChartId.set(chartId, chartRecords);
        });
        return recordsByChartId;
      })
    });
  }),

  // Array, one element per table row on the ranking table showing records of
  // all charts in the group. Each element is an object with `mainRecord` (a
  // record) and `otherRecords` (array of records).
  recordRows: computed('otherCharts.[]', 'records.[]', function() {
    let records = this.get('records');
    let mainChartId = this.get('mainChart').get('id');
    let otherCharts = this.get('otherCharts');
    let mainChartRecords = records.get(mainChartId);

    // For non-main charts, organize records as hashes from user ID to record
    let otherChartRecordsByUser = {};
    otherCharts.forEach((chart) => {
      let thisChartRecords = records.get(chart.get('id'));
      if (thisChartRecords) {
        let thisChartRecordsByUser = {};
        thisChartRecords.forEach((record) => {
          thisChartRecordsByUser[record.get('user').get('id')] = record;
        });
        otherChartRecordsByUser[chart.get('id')] = thisChartRecordsByUser;
      }
      else {
        // The promise hasn't completed yet
        otherChartRecordsByUser[chart.get('id')] = {};
      }
    });

    // Build the table row data
    let rows = [];
    if (mainChartRecords) {
      mainChartRecords.forEach((mainRecord) => {
        // For each main-chart record, we grab the other-charts records for the
        // same user
        let otherRecords = [];
        otherCharts.forEach((chart) => {
          let userId = mainRecord.get('user').get('id');
          let thisChartRecords = otherChartRecordsByUser[chart.get('id')];
          if (thisChartRecords.hasOwnProperty(userId)) {
            otherRecords.push(thisChartRecords[userId]);
          }
          else {
            // This user doesn't have a record for this chart
            otherRecords.push(null);
          }
        });

        rows.push({
          mainRecord: mainRecord,
          otherRecords: otherRecords,
        });
      });
    }
    // Else, the promise hasn't completed yet

    return rows;
  }),
});
