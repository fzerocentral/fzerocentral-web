import { A } from '@ember/array';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getFormField } from "../utils/forms";
import { FilterSelectControl } from "./filter-select";


export default class FilterApplyFormComponent extends Component {
  @tracked selectedFilterGroup = null;

  constructor(...args) {
    super(...args);

    this.filterSelect = new FilterSelectControl(
      this.formId, 'filter', this.getFilterOptions);
  }

  get formId() {
    return 'filter-apply-form';
  }
  get form() {
    return document.getElementById(this.formId);
  }

  /* Filter groups */

  @action
  updateSelectedFilterGroup(event) {
    let newSelectedFilterGroupId = event.target.value;

    // Set selected filter group and filter options.
    if (newSelectedFilterGroupId === '') {
      this.selectedFilterGroup = null;
      this.filterSelect.updateOptions();
      return;
    }
    this.selectedFilterGroup = this.args.filterGroups.findBy(
      'id', newSelectedFilterGroupId);
    let promise = this.filterSelect.updateOptions();

    // Set searchEnabled based on number of filters available.
    promise.then((filters) => {
      this.filterSelect.searchEnabled = (
        filters.meta.pagination.pages > 1);
    })

    // Reset selected filter / search text.
    this.filterSelect.clearFilter();
  }

  /* Compare types */

  get compareOptions() {
    let group = this.selectedFilterGroup;
    if (!group) {
      return [];
    }

    if (group.get('kind') === 'numeric') {
      return ['is', 'is NOT', '>=', '<='];
    }
    else {
      return ['is', 'is NOT'];
    }
  }

  get selectedCompareOption() {
    return getFormField(this.form, 'compare-option').value;
  }
  set selectedCompareOption(value) {
    getFormField(this.form, 'compare-option').value = value;
  }

  compareTypeTextToSuffix(text) {
    let textToSuffix = {
      'is': '',
      'is NOT': 'n',
      '>=': 'ge',
      '<=': 'le',
    };
    return textToSuffix[text];
  }
  compareTypeSuffixToText(suffix) {
    let suffixToText = {
      '': 'is',
      'n': 'is NOT',
      'ge': '>=',
      'le': '<=',
    };
    return suffixToText[suffix];
  }

  /* Filters */

  @action
  getFilterOptions(searchText) {
    if (!this.selectedFilterGroup) {
      return A([]);
    }

    return this.args.controllerGetFilterOptions(
      this.selectedFilterGroup.id, searchText);
  }

  @action
  addFilter() {
    // Get the existing applied-filter strings
    let filtersString = this.args.appliedFiltersString;
    let filterStrings = [];
    if (filtersString !== null) {
      filterStrings = filtersString.split('-');
    }

    // Make a string for the newly added filter
    let newFilterId = this.filterSelect.selectedFilterId;
    let compareOptionTypeSuffix =
      this.compareTypeTextToSuffix(this.selectedCompareOption);
    let newFilterString = `${newFilterId}${compareOptionTypeSuffix}`;

    // Add the new string
    filterStrings.push(newFilterString);
    let newAppliedFiltersString = filterStrings.join('-');
    this.args.updateAppliedFiltersString(newAppliedFiltersString);
  }

  @action
  removeFilter(index) {
    // We're assuming this'll only ever be called with a valid index.
    let filtersString = this.args.appliedFiltersString;
    let filterStrings = filtersString.split('-');
    // Remove 1 element at the specified index.
    filterStrings.splice(index, 1);

    if (filterStrings.length === 0) {
      // We expect null, not '', if there's 0 filters applied.
      this.args.updateAppliedFiltersString(null);
    }
    else {
      this.args.updateAppliedFiltersString(filterStrings.join('-'));
    }
  }

  get appliedFilterSpecs() {
    let appliedFiltersString = this.args.appliedFiltersString;
    if (appliedFiltersString === null) {
      return A([]);
    }

    let appliedFilterStrings = appliedFiltersString.split('-');
    let appliedFilterSpecs = A([]);
    appliedFilterStrings.forEach((afString) => {
      let regexMatch = /([0-9]+)([a-zA-Z]*)/.exec(afString);
      if (regexMatch === null) {
        // Applied filter string was invalid
        return;
      }
      appliedFilterSpecs.pushObject({
        filterId: regexMatch[1], typeSuffix: regexMatch[2]});
    });
    return appliedFilterSpecs;
  }

  get appliedFilters() {
    let appliedFilters = A([]);

    this.appliedFilterSpecs.forEach((afSpec) => {
      let compareText = this.compareTypeSuffixToText(afSpec.typeSuffix);
      let filterObj = this.args.appliedFilterObjs.find(
        f => f.get('id') === afSpec.filterId);
      if (!filterObj) {
        // Perhaps appliedFilterObjs still has to be updated.
        return;
      }

      let filterName = filterObj.get('name');
      let filterGroupName = filterObj.get('filterGroup').get('name');
      let display = `${filterGroupName} ${compareText} ${filterName}`;

      appliedFilters.push({
        filterGroup: filterObj.get('filterGroup'),
        display: display,
      });
    });

    return appliedFilters;
  }
}
