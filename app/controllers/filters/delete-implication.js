import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { FilterSelectControl } from '../../utils/filter-select';
import { setFormError } from '../../utils/forms';

export default class FiltersDeleteImplicationController extends Controller {
  @service store;
  @service nonEmberDataApi;

  @tracked model;
  formId = 'delete-implication-form';

  constructor(...args) {
    super(...args);

    this.filterSelect = new FilterSelectControl(this.getTargetOptions);
  }

  get filterGroup() {
    return this.model.filter.filterGroup;
  }

  get form() {
    return document.getElementById(this.formId);
  }

  @action
  getTargetOptions(searchText) {
    return this.store.query('filter', {
      implied_by_filter_id: this.model.filter.id,
      name_search: searchText,
    });
  }

  @action
  deleteImplication() {
    let targetId = this.filterSelect.selectedFilterId;

    if (!targetId) {
      setFormError(this.form, 'Please select an implication to delete.');
      return;
    }

    this.nonEmberDataApi
      .deleteFilterImplication(this.model.filter.id, targetId)
      .then((data) => {
        if ('errors' in data) {
          throw new Error(data.errors[0].detail);
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
