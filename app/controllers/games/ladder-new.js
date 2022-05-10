import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import LadderModel from '../../models/ladder';
import { getFormField, setFormError } from '../../utils/forms';

export default class GamesLadderNewController extends Controller {
  @service nonEmberDataApi;

  KIND_OPTIONS = LadderModel.KIND_OPTIONS;
  formId = 'create-ladder-form';

  get form() {
    return document.getElementById(this.formId);
  }

  @action
  createLadder() {
    let attributes = {
      name: getFormField(this.form, 'name').value,
      kind: getFormField(this.form, 'kind').value,
      // Default to empty string
      'filter-spec': getFormField(this.form, 'filter-spec').value ?? '',
    };
    let chartGroupId = getFormField(this.form, 'chart-group').value;

    this.nonEmberDataApi
      .createLadder(this.model.game.id, chartGroupId, attributes)
      .then((data) => {
        if ('errors' in data) {
          let error = data.errors[0];
          // Take the string after the last / to be the field name.
          let fieldName = error.source.pointer.split('/').slice(-1)[0];
          throw new Error(`${fieldName}: ${error.detail}`);
        }

        // Success.
        this.target.transitionTo(
          'games.ladders-manage',
          this.model.game.shortCode
        );
      })
      .catch((error) => {
        setFormError(this.form, error.message);
      });
  }
}
