import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr(),
  // 'choosable' or 'implied'
  usageType: attr(),
  // Used when the filterGroup is numeric
  numericValue: attr(),

  filterGroup: belongsTo('filter-group'),
  records: hasMany('record'),
});
