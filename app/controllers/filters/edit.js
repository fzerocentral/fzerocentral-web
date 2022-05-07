import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { getFormField, setFormError } from '../../utils/forms';

export default class FiltersEditController extends Controller {
  @service nonEmberDataApi;

  formId = 'edit-filter-form';

  get filterGroup() {
    return this.model.filter.filterGroup;
  }

  get form() {
    return document.getElementById(this.formId);
  }

  @action
  saveEdits() {
    let attributes = {
      name: getFormField(this.form, 'name').value,
    };
    if (this.filterGroup.get('kind') === 'numeric') {
      attributes.numericValue = getFormField(this.form, 'numeric-value').value;
    }

    this.nonEmberDataApi
      .editFilter(this.model.filter.id, attributes)
      .then((data) => {
        if ('errors' in data) {
          let error = data.errors[0];
          // Take the string after the last / to be the field name.
          let fieldName = error.source.pointer.split('/').slice(-1)[0];
          throw new Error(`${fieldName}: ${error.detail}`);
        }

        // Success.
        this.target.transitionTo(
          'filter-groups.show',
          this.filterGroup.get('id')
        );
      })
      .catch((error) => {
        setFormError(this.form, error.message);
      });
  }
}
