import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr(),
  showChartsTogether: attr(),

  game: belongsTo('game'),
  parentGroup: belongsTo('chart-group', { inverse: 'childGroups' }),
  childGroups: hasMany('chart-group', { inverse: 'parentGroup' }),
  charts: hasMany('chart'),
});
