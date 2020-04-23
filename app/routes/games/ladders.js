import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      game: this.get('store').findRecord('game', params.game_id),
      mainLadders: this.get('store').query(
        'ladder', {game_id: params.game_id, kind: 'main'}),
      sideLadders: this.get('store').query(
        'ladder', {game_id: params.game_id, kind: 'side'})
    });
  },
});
