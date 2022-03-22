import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class GameFilterGroupsRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      filterGroups: this.store.query(
        'filter-group', {game_id: params.game_id}),
      game: this.store.findRecord(
        'game', params.game_id),
    });
  }
}
