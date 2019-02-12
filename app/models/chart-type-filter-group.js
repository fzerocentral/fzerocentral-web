import DS from 'ember-data';

export default DS.Model.extend({
  showByDefault: DS.attr('boolean'),
  orderInChartType: DS.attr('number'),

  filterGroup: DS.belongsTo('filter-group'),
  chartType: DS.belongsTo('chart-type'),
});
