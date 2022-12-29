import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { getGameByShortCode } from '../../models/game';
import { filterSpecStrToItems } from '../../utils/filter-specs';

export default class GamesLaddersRoute extends Route {
  @service store;

  model(params) {
    let mainLaddersPromise = this.store.query('ladder', {
      game_code: params.game_code,
      kind: 'main',
      include: 'chart_group,ladder_chart_tags',
    });
    let sideLaddersPromise = this.store.query('ladder', {
      game_code: params.game_code,
      kind: 'side',
      include: 'chart_group,ladder_chart_tags',
    });

    return RSVP.hash({
      chartTags: this.store.query('chart-tag', {
        game_code: params.game_code,
        fields: 'id,name',
      }),
      game: getGameByShortCode(this.store, params.game_code),
      mainLadders: mainLaddersPromise,
      sideLadders: sideLaddersPromise,

      ladderFilterObjs: this.getLadderFilterObjs(
        mainLaddersPromise,
        sideLaddersPromise
      ),
    });
  }

  /*
  Get all the Filter model objects referenced by the ladders' filter specs.
   */
  getLadderFilterObjs(mainLaddersPromise, sideLaddersPromise) {
    return Promise.all([mainLaddersPromise, sideLaddersPromise]).then(
      ([mainLaddersResult, sideLaddersResult]) => {
        let allLadders = mainLaddersResult
          .toArray()
          .concat(sideLaddersResult.toArray());
        let filterIds = new Set();

        for (let ladder of allLadders) {
          let items = filterSpecStrToItems(ladder.filterSpec);
          for (let item of items) {
            filterIds.add(item.filterId);
          }
        }

        return this.store.query('filter', {
          filter_ids: Array.from(filterIds).join(','),
        });
      }
    );
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
