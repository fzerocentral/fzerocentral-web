import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class LadderModel extends Model {
  @attr('string') name;
  @attr('string') kind;
  @attr('string') filterSpec;
  @attr('number') orderInGameAndKind;

  @belongsTo('chart-group') chartGroup;
  @belongsTo('game') game;
  @hasMany('ladder-chart-tag') ladderChartTags;

  static KIND_OPTIONS = ['main', 'side'];
}
