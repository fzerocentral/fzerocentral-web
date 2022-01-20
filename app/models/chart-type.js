import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartTypeModel extends Model {
  @attr('string') name;
  @attr('string') format_spec;
  @attr('boolean') order_ascending;

  @belongsTo('game') game;
  @hasMany('filter-group') filterGroups;
}
