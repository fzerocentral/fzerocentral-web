import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { PromiseArray } from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { FilterSelectControl } from '../../utils/filter-select';
import { setFormError } from '../../utils/forms';

export default class FiltersAddImplicationController extends Controller {
  @service store;
  @service nonEmberDataApi;

  @tracked model;
  formId = 'add-implication-form';

  constructor(...args) {
    super(...args);

    this.filterSelect = new FilterSelectControl(
      this.formId,
      'filter',
      this.getTargetOptions
    );
  }

  get filterGroup() {
    return this.model.filter.filterGroup;
  }

  get form() {
    return document.getElementById(this.formId);
  }

  getImpliedTypeFilters(searchText) {
    return this.store.query('filter', {
      filter_group_id: this.filterGroup.get('id'),
      usage_type: 'implied',
      name_search: searchText,
    });
  }

  @action
  getTargetOptions(searchText) {
    return PromiseArray.create({
      promise: this.getImpliedTypeFilters(searchText).then((iFilters) => {
        let targetOptions = A([]);
        let alreadyImpliedIds = this.model.alreadyImpliedFilters.getEach('id');

        // Options are the implied-type filters in this filter group,
        // excluding filters that are already implied by this filter
        iFilters.forEach((iFilter) => {
          if (alreadyImpliedIds.includes(iFilter.id)) {
            return;
          }
          targetOptions.pushObject(iFilter);
        });
        return targetOptions;
      }),
    });
  }

  @action
  addImplication() {
    let targetId = this.filterSelect.selectedFilterId;

    if (!targetId) {
      setFormError(
        this.form,
        'Please select the target filter for implication.'
      );
      return;
    }

    this.nonEmberDataApi
      .addFilterImplication(this.model.filter.id, targetId)
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
