import { A } from '@ember/array';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FilterGroupModel extends Model {
  @attr('string') name;
  @attr('string') kind;
  @attr('string') description;
  @attr('number') orderInGame;
  @attr('boolean') showByDefault;

  @belongsTo('game') game;
  @hasMany('filter') filters;
  @hasMany('chart-type') chartTypes;

  // The group's filters should be multiple
  // choice selected, or entered as a number
  get KIND_OPTIONS() {
    return A(['select', 'numeric']);
  }
}
