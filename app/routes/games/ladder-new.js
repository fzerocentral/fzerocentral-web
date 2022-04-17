import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';


export default class GamesLadderNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chartGroups: this.store.query(
        'chartGroup', {game_id: params.game_id}),
      game: this.store.findRecord('game', params.game_id),
    });
  }
}
