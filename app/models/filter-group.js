import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),
  kind: DS.attr(),
  description: DS.attr(),

  filters: DS.hasMany('filter'),
  chartTypes: DS.hasMany('chart-type'),
});
