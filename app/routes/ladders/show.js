import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  @action
  deleteLadder() {
    if (window.confirm("Are you sure you want to delete this ladder?")) {
      let ladder = this.modelFor(this.routeName);
      let gameId = ladder.get('game.id');

      // Delete the ladder.
      ladder.destroyRecord().then(() => {
        // Redirect to ladders for this game.
        this.transitionTo('games.ladders', gameId);
      });
    }
  },
});
