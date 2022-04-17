import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartTypeModel extends Model {
  @attr('string') name;
  @attr('string') formatSpec;
  @attr('boolean') orderAscending;

  @belongsTo('game') game;
  @hasMany('filter-group') filterGroups;
}
