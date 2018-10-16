import DS from 'ember-data';

export default DS.Model.extend({
  value: DS.attr('number'),
  achievedAt: DS.attr('date'),
  isImprovement: DS.attr(),
  rank: DS.attr(),
  valueDisplay: DS.attr(),

  chart: DS.belongsTo('chart'),
  user: DS.belongsTo('user'),
  filters: DS.hasMany('filter'),
});
