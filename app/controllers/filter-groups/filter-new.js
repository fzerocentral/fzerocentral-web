import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import FilterModel from '../../models/filter';
import { getFormField, setFormError } from '../../utils/forms';

export default class FilterGroupsFilterNewController extends Controller {
  @service nonEmberDataApi;

  FILTER_USAGE_TYPE_OPTIONS = FilterModel.USAGE_TYPE_OPTIONS;
  formId = 'create-filter-form';

  get form() {
    return document.getElementById(this.formId);
  }

  @action
  createFilter() {
    let attributes = {
      name: getFormField(this.form, 'name').value,
    };
    if (this.model.filterGroup.kind === 'select') {
      attributes.usageType = getFormField(this.form, 'usage-type').value;
    }
    if (this.model.filterGroup.kind === 'numeric') {
      attributes.numericValue = getFormField(this.form, 'numeric-value').value;
    }

    this.nonEmberDataApi
      .createFilter(this.model.filterGroup.id, attributes)
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
          this.model.filterGroup.get('id')
        );
      })
      .catch((error) => {
        setFormError(this.form, error.message);
      });
  }
}
