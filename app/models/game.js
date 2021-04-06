import Model, { attr, hasMany } from '@ember-data/model';

export default class GameModel extends Model {
  @attr('string') name;

  @hasMany('chart-type') chartTypes;
}
