import Model, { attr, belongsTo } from '@ember-data/model';

export default class LadderChartTagModel extends Model {
  @attr('number') weight;

  @belongsTo('ladder') ladder;
  @belongsTo('chart-tag') chartTag;
}
