import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';


export default class LaddersShowController extends Controller {
  @service nonEmberDataApi;

  set ladderDeleteError(error) {
    document.getElementById('ladder-delete-error').textContent = error;
  }

  @action
  deleteLadder() {
    if (!window.confirm("Are you sure you want to delete this ladder?")) {
      return;
    }

    let gameId = this.model.ladder.game.get('id');

    // Delete the ladder.
    this.nonEmberDataApi.deleteResource('ladders', this.model.ladder.id)
    .then(data => {
      if ('errors' in data) {
        let error = data.errors[0];
        throw new Error(error.detail);
      }

      // Success.
      this.target.transitionTo('games.ladders', gameId);
    })
    .catch(error => {
      this.ladderDeleteError = error.message;
    });
  }
}
