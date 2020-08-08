import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  format_spec: attr('string'),
  order_ascending: attr('boolean'),

  game: belongsTo('game'),
  filterGroups: hasMany('filter-group'),
});
