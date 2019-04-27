import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  // 'select' or 'numeric' - denoting the group's filters should be multiple
  // choice selected, or entered as a number
  kind: DS.attr(),
  description: DS.attr(),

  // Chart-type-specific attribute
  showByDefault: DS.attr('boolean'),

  filters: DS.hasMany('filter'),
  chartTypes: DS.hasMany('chart-type'),
});
