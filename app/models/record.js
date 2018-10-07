import DS from 'ember-data';

export default DS.Model.extend({
  value: DS.attr(),
  achieved_at: DS.attr(),
  is_improvement: DS.attr(),
  rank: DS.attr(),
  value_display: DS.attr(),

  chart: DS.belongsTo('chart'),
  user: DS.belongsTo('user'),
});
