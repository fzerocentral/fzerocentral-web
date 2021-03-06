import { action } from '@ember/object';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chartGroups: this.get('store').query(
        'chartGroup', {game_id: params.game_id}),
      game: this.get('store').findRecord('game', params.game_id),
      ladder: this.get('store').createRecord('ladder'),
    });
  },

  @action
  saveLadder() {
    let game = this.modelFor(this.routeName).game;
    let newLadder = this.modelFor(this.routeName).ladder;

    newLadder.set('game', game);

    // If no filterSpec is set, set an empty string.
    if (newLadder.get('filterSpec') === undefined) {
      newLadder.set('filterSpec', '');
    }

    newLadder.save().then(() => this.transitionTo('games.ladders', game.id));
  },

  @action
  willTransition() {
    // rollbackAttributes() removes the ladder from the store
    // if the model 'isNew'
    this.modelFor(this.routeName).ladder.rollbackAttributes();
  }
});
