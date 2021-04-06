import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartModel extends Model {
  @attr('string') name;

  @belongsTo('chart-group') chartGroup;
  @belongsTo('chart-type') chartType;
  @hasMany('record') records;
}
