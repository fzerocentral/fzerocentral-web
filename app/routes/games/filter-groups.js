import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GameFilterGroupsRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filterGroups: this.store.query('filter-group', {
        game_code: params.game_code,
      }),
      game: getGameByShortCode(this.store, params.game_code),
    });
  }
}
