import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
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

    this.filterSelect = new FilterSelectControl(this.getTargetOptions);
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
    return this.getImpliedTypeFilters(searchText).then((iFilters) => {
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
      // Since we dropped the meta attribute, use another way to indicate
      // whether there are multiple pages.
      // This is inexact because we're checking the page count of the
      // original request, and reporting whether there are multiple pages
      // on the filtered result. But it's good enough for this purpose.
      targetOptions.hasMultiplePages = iFilters.meta.pagination.pages > 1;
      return targetOptions;
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
