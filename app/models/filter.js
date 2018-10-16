import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  numericValue: DS.attr(),

  filterGroups: DS.hasMany('filter-group'),
  records: DS.hasMany('record'),
});
