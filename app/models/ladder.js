import { A } from '@ember/array';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class LadderModel extends Model {
  @attr('string') name;
  @attr('string') kind;
  @attr('string') filterSpec;
  @attr('number') orderInGameAndKind;

  @belongsTo('chart-group') chartGroup;
  @belongsTo('game') game;

  get KIND_OPTIONS() {return A(['main', 'side']);}
}
