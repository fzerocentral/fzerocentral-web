import { A } from '@ember/array';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';


export default class FilterApplyFormComponent extends Component {
  @tracked selectedCompareOption = null;
  @tracked selectedFilter = null;

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
        // TODO: Should somehow notify the user that an applied filter string
        // was invalid
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
      let filterId = afSpec.filterId;
      let typeSuffix = afSpec.typeSuffix;
      let filterObj = this.args.appliedFilterObjs.find(
        f => f.get('id') === filterId);
      let filterName = filterObj.get('name');
      let filterGroupName = filterObj.get('filterGroup').get('name');
      let display = null;

      if (typeSuffix === '') {
        // No suffix; simple test for filter presence
        display = `${filterGroupName}: ${filterName}`;
      }
      else if (typeSuffix === 'n') {
        // Negation
        display = `${filterGroupName}: NOT ${filterName}`;
      }
      else if (typeSuffix === 'le') {
        // Less than or equal to, for numeric filters
        display = `${filterGroupName}: <= ${filterName}`;
      }
      else if (typeSuffix === 'ge') {
        // Greater than or equal to, for numeric filters
        display = `${filterGroupName}: >= ${filterName}`;
      }
      else {
        // TODO: Should somehow notify the user that an applied filter
        // typeSuffix was invalid
        return;
      }
      appliedFilters.pushObject({
        filterGroup: filterObj.get('filterGroup'),
        display: display});
    });

    return appliedFilters;
  }

  get compareOptions() {
    let group = this.args.selectedFilterGroup;
    if (!group) {
      return A([]);
    }

    let compareOptions = A([]);
    compareOptions.pushObject({text: "is", typeSuffix: ''});
    compareOptions.pushObject({text: "is NOT", typeSuffix: 'n'});
    if (group.get('kind') === 'numeric') {
      compareOptions.pushObject({text: ">=", typeSuffix: 'ge'});
      compareOptions.pushObject({text: "<=", typeSuffix: 'le'});
    }

    return compareOptions;
  }

  get defaultCompareOption() {
    return this.compareOptions.find(option => option.text === 'is');
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
    let newFilterId = this.selectedFilter.get('id');
    let compareOptionTypeSuffix =
      this.selectedCompareOption.typeSuffix;
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

  @action
  updateSelectedFilterGroup(newSelectedFilterGroup) {
    this.args.controllerUpdateSelectedFilterGroup(newSelectedFilterGroup);

    // If selectedFilter is not in the newly selected filter group,
    // reset it to null.
    if (this.selectedFilter) {
      if (this.selectedFilter.get('filterGroup').get('id')
          !== this.args.selectedFilterGroup.get('id')) {
        this.selectedFilter = null;
      }
    }

    if (this.selectedCompareOption) {
      // If selectedCompareOption does not apply to the newly selected
      // filter group, reset it to default.
      let matchingOption = this.compareOptions.find(
        option => option.text === this.selectedCompareOption.text);
      if (!matchingOption) {
        this.selectedCompareOption = this.defaultCompareOption;
      }
    }
    else {
      // No compare option is selected yet; set to default to potentially save
      // the user a click/tap or two.
      this.selectedCompareOption = this.defaultCompareOption;
    }
  }
}
