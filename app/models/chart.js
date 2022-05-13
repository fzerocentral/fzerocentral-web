import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartModel extends Model {
  @attr('string') name;
  @attr('number') orderInGroup;

  @belongsTo('chart-group') chartGroup;
  @belongsTo('chart-type') chartType;
  @hasMany('chart-tag') chartTags;
  @hasMany('record') records;
}
