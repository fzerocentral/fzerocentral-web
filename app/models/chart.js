import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr(),

  chartGroup: belongsTo('chart-group'),
  chartType: belongsTo('chart-type'),
  records: hasMany('record'),
});
