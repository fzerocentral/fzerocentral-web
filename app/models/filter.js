import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  numericValue: DS.attr(),

  filterGroup: DS.belongsTo('filter-group'),
  records: DS.hasMany('record'),
});
