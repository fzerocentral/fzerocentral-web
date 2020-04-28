import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  chartGroup: null,
  mainChartIdQueryArg: null,
  store: service('store'),

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

  // Object mapping each chart ID of this group to an array of records,
  // as a sorted ranking.
  @computed('charts')
  get records() {
    let chartRecordsPromises = [];
    this.get('charts').forEach((chart) => {
      // Call API to get this chart's records
      let chartId = chart.get('id');
      let args = {
        chart_id: chartId, sort: 'value', ranked_entity: 'user',
        per_page: 1000};
      let chartRecordsPromise = this.get('store').query('record', args).then(
        (chartRecords) => {return [chartId, chartRecords];}
      );
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
  },

  // Array, one element per table row on the ranking table showing records of
  // all charts in the group. Each element is an object with `mainRecord` (a
  // record) and `otherRecords` (array of records).
  @computed('otherCharts.[]', 'records.[]')
  get recordRows() {
    if (this.get('mainChartId') === null) {
      return A([]);
    }

    let records = this.get('records');
    let otherCharts = this.get('otherCharts');
    let mainChartRecords = records.get(this.get('mainChartId'));

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
          if (Object.hasOwnProperty.call(thisChartRecords, userId)) {
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
  },
});
