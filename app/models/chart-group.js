import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ChartGroupModel extends Model {
  @attr('string') name;
  @attr('number') orderInParent;
  @attr('boolean') showChartsTogether;

  @belongsTo('game') game;
  @belongsTo('chart-group', { inverse: 'childGroups' }) parentGroup;
  @hasMany('chart-group', { inverse: 'parentGroup' }) childGroups;
  @hasMany('chart') charts;
}
