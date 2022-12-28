import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GamesShowRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      game: getGameByShortCode(this.store, params.game_code),
      mainLadders: this.store.query('ladder', {
        game_code: params.game_code,
        kind: 'main',
      }),
      sideLadders: this.store.query('ladder', {
        game_code: params.game_code,
        kind: 'side',
      }),
    });
  }
}
