import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chartTypes: this.store.query(
        'chart-type', {game_id: params.game_id}),
      game: this.store.findRecord('game', params.game_id),
      mainLadders: this.store.query(
        'ladder', {game_id: params.game_id, kind: 'main'}),
      sideLadders: this.store.query(
        'ladder', {game_id: params.game_id, kind: 'side'}),
      topLevelChartGroups: this.store.query(
        'chart-group', {game_id: params.game_id, parent_group_id: null})
    });
  }
});
