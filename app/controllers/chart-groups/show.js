import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  queryParams: ['mainChartId'],
  mainChartId: null,

  mainChart: computed('mainChartId', 'model', function() {
    let mainChartId = this.mainChartId;
    let chartGroup = this.model;

    if (mainChartId) {
      return chartGroup.get('charts').findBy('id', mainChartId);
    }
    else {
      return chartGroup.get('charts').objectAt(0);
    }
  })
});
