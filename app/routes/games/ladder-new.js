import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GamesLadderNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chartGroups: this.store.query('chartGroup', {
        game_code: params.game_code,
      }),
      game: getGameByShortCode(this.store, params.game_code),
    });
  }
}
