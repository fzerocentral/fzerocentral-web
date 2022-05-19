import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getFormField } from '../utils/forms';
import { FilterSelectControl } from '../utils/filter-select';
import {
  addFilterSpecItem,
  Modifier,
  removeFilterSpecItem,
} from '../utils/filter-specs';

export default class FilterApplyFormComponent extends Component {
  @service store;

  @tracked selectedFilterGroup = null;

  constructor(...args) {
    super(...args);

    this.filterSelect = new FilterSelectControl(this.getFilterOptions);
  }

  get formId() {
    return 'filter-apply-form';
  }
  get form() {
    return document.getElementById(this.formId);
  }

  /* Filter groups */

  @action
  onFilterGroupChange(event) {
    let newSelectedFilterGroupId = event.target.value;

    // Set selected filter group and filter options.
    if (newSelectedFilterGroupId === '') {
      this.selectedFilterGroup = null;
    } else {
      this.selectedFilterGroup = this.args.filterGroups.findBy(
        'id',
        newSelectedFilterGroupId
      );
    }
    this.filterSelect.initializeOptions();
  }

  /* Filter-application modifiers */

  get modifierOptions() {
    let group = this.selectedFilterGroup;
    if (!group) {
      return [];
    }

    if (group.get('kind') === 'numeric') {
      return [
        Modifier.Equal,
        Modifier.NotEqual,
        Modifier.GreaterOrEqual,
        Modifier.LessOrEqual,
      ];
    } else {
      return [Modifier.Equal, Modifier.NotEqual];
    }
  }

  get selectedModifier() {
    return getFormField(this.form, 'modifier').value;
  }
  set selectedModifier(value) {
    getFormField(this.form, 'modifier').value = value;
  }

  /* Filters */

  @action
  getFilterOptions(searchText) {
    if (!this.selectedFilterGroup) {
      // Promise that resolves to empty array
      return new Promise((resolve) => {
        resolve(A([]));
      });
    }
    return this.store.query('filter', {
      filter_group_id: this.selectedFilterGroup.id,
      name_search: searchText,
    });
  }

  @action
  addFilter() {
    if (!this.filterSelect.selectedFilterId) {
      window.alert('No filter has been selected yet.');
      return;
    }
    let newStr = addFilterSpecItem(
      this.args.appliedFiltersString,
      this.filterSelect.selectedFilterId,
      this.selectedModifier
    );
    this.args.updateAppliedFiltersString(newStr);
  }

  @action
  removeFilter(index) {
    let newStr = removeFilterSpecItem(this.args.appliedFiltersString, index);
    this.args.updateAppliedFiltersString(newStr);
  }
}
