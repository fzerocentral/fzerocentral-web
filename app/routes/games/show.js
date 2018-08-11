import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      game: this.get('store').findRecord('game', params.game_id),
      topLevelChartGroups: this.get('store').query('chart-group', {game_id: params.game_id, parent_group_id: null})
    });
  }
});
