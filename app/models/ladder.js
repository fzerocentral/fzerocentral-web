import { A } from '@ember/array';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class LadderModel extends Model {
  @attr name;
  @attr kind;
  @attr filterSpec;
  @attr('number') orderInGameAndKind;

  @belongsTo('chart-group') chartGroup;
  @belongsTo('game') game;

  get KIND_OPTIONS() {return A(['main', 'side']);}
}
