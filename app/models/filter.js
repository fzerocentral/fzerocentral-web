import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  // 'choosable' or 'implied'
  usageType: DS.attr(),
  // Used when the filterGroup is numeric
  numericValue: DS.attr(),

  filterGroup: DS.belongsTo('filter-group'),
  records: DS.hasMany('record'),
});
