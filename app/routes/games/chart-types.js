import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GameChartTypesRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chartTypes: this.store.query('chart-type', {
        game_code: params.game_code,
      }),
      filterGroups: this.store.query('filter-group', {
        game_code: params.game_code,
      }),
      game: getGameByShortCode(this.store, params.game_code),
    });
  }
}
