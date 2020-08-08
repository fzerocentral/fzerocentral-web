import Model, { attr, hasMany } from '@ember-data/model';

export default Model.extend({
  name: attr(),

  chartTypes: hasMany('chart-type'),
});
