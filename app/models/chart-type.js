import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  format_spec: DS.attr('string'),
  order_ascending: DS.attr('boolean'),

  game: DS.belongsTo('game'),
});
