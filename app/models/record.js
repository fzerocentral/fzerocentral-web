import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class RecordModel extends Model {
  @attr('number') value;
  @attr('date') dateAchieved;

  @belongsTo('chart') chart;
  @belongsTo('player') player;
  @hasMany('filter') filters;
}
