import Model, { attr, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr(),
  // 'select' or 'numeric' - denoting the group's filters should be multiple
  // choice selected, or entered as a number
  kind: attr(),
  description: attr(),

  // Chart-type-specific attribute
  showByDefault: attr('boolean'),

  filters: hasMany('filter'),
  chartTypes: hasMany('chart-type'),
});
