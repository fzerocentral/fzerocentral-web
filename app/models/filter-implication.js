import DS from 'ember-data';

export default DS.Model.extend({
  implyingFilter: DS.belongsTo('filter'),
  impliedFilter: DS.belongsTo('filter'),
});
