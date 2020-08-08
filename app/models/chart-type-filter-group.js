import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  showByDefault: attr('boolean'),
  orderInChartType: attr('number'),

  filterGroup: belongsTo('filter-group'),
  chartType: belongsTo('chart-type'),
});
