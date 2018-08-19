import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  show_charts_together: DS.attr(),

  game: DS.belongsTo('game'),
  parentGroup: DS.belongsTo('chart-group', { inverse: 'childGroups' }),
  childGroups: DS.hasMany('chart-group', { inverse: 'parentGroup' }),
  charts: DS.hasMany('chart'),
});
