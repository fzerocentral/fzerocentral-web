import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default Model.extend({
  value: attr('number'),
  achievedAt: attr('date'),
  isImprovement: attr(),
  rank: attr(),
  valueDisplay: attr(),

  chart: belongsTo('chart'),
  user: belongsTo('user'),
  filters: hasMany('filter'),
});
