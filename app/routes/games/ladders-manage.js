import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';

export default class GamesLaddersRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chartTags: this.store.query('chart-tag', {
        game_code: params.game_code,
        fields: 'id,name',
      }),
      game: getGameByShortCode(this.store, params.game_code),
      mainLadders: this.store.query('ladder', {
        game_code: params.game_code,
        kind: 'main',
        include: 'chart_group,ladder_chart_tags',
      }),
      sideLadders: this.store.query('ladder', {
        game_code: params.game_code,
        kind: 'side',
        include: 'chart_group,ladder_chart_tags',
      }),
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
