import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/* For some reason, it felt easier to write component-related functionality
 in a separate class from the component itself. */
export class FilterSelectControl {
  @tracked options = [];
  @tracked searchEnabled = false;
  @tracked searchTerm = '';
  @tracked selectedFilterId = null;

  constructor(
    baseFieldName,
    getOptions,
    { hasEmptyOption = false, initialFilter = null } = {}
  ) {
    this.baseFieldName = baseFieldName;
    this.getOptions = getOptions;
    this.hasEmptyOption = hasEmptyOption;
    this.initialFilter = initialFilter;
  }

  updateOptions() {
    let getOptionsPromise = this.getOptions(this.searchTerm);

    return getOptionsPromise.then((filters) => {
      let options = [];

      if (!this.searchEnabled && this.hasEmptyOption) {
        options.push({ value: '', display: '-----' });
      }

      filters.forEach((filter) => {
        options.push({ value: filter.id, display: filter.name });
      });

      this.options = options;

      return filters;
    });
  }

  initializeOptions() {
    if (this.initialFilter) {
      this.searchTerm = this.initialFilter.name;
      this.selectedFilterId = this.initialFilter.id;
    } else {
      this.searchTerm = '';
      this.selectedFilterId = null;
    }

    return this.updateOptions().then((filters) => {
      // Set searchEnabled based on number of filters available.
      if (filters.meta) {
        this.searchEnabled = filters.meta.pagination.pages > 1;
      } else {
        this.searchEnabled = false;
      }
    });
  }

  @action
  onSelect(event) {
    this.selectedFilterId = event.target.value;
  }

  @action
  onSearchInput(event) {
    this.searchTerm = event.target.value;

    // Update options, then update the hidden field value
    this.updateOptions().then((filters) => {
      // Look through the filter options to find a filter with a name that
      // matches the search field.
      let matchingFilter = filters.find(
        (filter) => filter.name === this.searchTerm
      );

      if (matchingFilter) {
        // Assign that matching filter's ID to the real (hidden) field.
        this.selectedFilterId = matchingFilter.id;
      } else {
        this.selectedFilterId = null;
      }
    });
  }
}
