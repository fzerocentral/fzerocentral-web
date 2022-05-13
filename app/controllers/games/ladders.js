import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import config from '../../config/environment';

export default class GamesLaddersController extends Controller {
  @service nonEmberDataApi;

  devMode = config.APP.devMode;

  set ladderDeleteError(error) {
    document.getElementById('ladder-delete-error').textContent = error;
  }

  @action
  deleteLadder(ladderId) {
    if (!window.confirm('Are you sure you want to delete this ladder?')) {
      return;
    }

    // Delete the ladder.
    this.nonEmberDataApi
      .deleteResource('ladders', ladderId)
      .then((data) => {
        if ('errors' in data) {
          let error = data.errors[0];
          throw new Error(error.detail);
        }

        // Success.
        this.ladderDeleteError = '';
        // Refresh model, which includes the lists of ladders.
        this.target.send('refreshModel');
      })
      .catch((error) => {
        this.ladderDeleteError = error.message;
      });
  }
}
