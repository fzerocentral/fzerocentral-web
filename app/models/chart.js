import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr(),

  chartGroup: DS.belongsTo('chart-group'),
  records: DS.hasMany('record'),
});
