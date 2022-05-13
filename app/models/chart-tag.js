import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartTagModel extends Model {
  @attr('string') name;
  @attr('string') totalName;

  @belongsTo('game') game;
  @belongsTo('chart-type') primaryChartType;
  @hasMany('chart') charts;
  @hasMany('ladder-chart-tag') ladderChartTags;
}
