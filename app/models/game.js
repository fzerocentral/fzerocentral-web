import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),

  chartTypes: DS.hasMany('chart-type'),
});
