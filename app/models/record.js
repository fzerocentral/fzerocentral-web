import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class RecordModel extends Model {
  @attr('number') value;
  @attr('date') achievedAt;
  @attr('boolean') isImprovement;
  @attr('number') rank;
  @attr('string') valueDisplay;

  @belongsTo('chart') chart;
  @belongsTo('user') user;
  @hasMany('filter') filters;
}
