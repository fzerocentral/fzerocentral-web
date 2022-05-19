import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/* Control layer for the filter-select component. */
export class FilterSelectControl {
  @tracked options = [];
  @tracked searchEnabled = false;
  @tracked searchText = '';
  @tracked selectedFilterId = null;

  constructor(getOptions, { initialFilter = null } = {}) {
    this.getOptions = getOptions;
    this.initialFilter = initialFilter;
  }

  updateOptions() {
    return this.getOptions(this.searchText).then((filters) => {
      this.options = filters;
      return filters;
    });
  }

  initializeOptions() {
    if (this.initialFilter) {
      this.searchText = this.initialFilter.name;
      this.selectedFilterId = this.initialFilter.id;
    } else {
      this.searchText = '';
      this.selectedFilterId = null;
    }

    return this.updateOptions().then((filters) => {
      // Set searchEnabled based on whether there are multiple pages of results.
      // Can infer multiple pages in two ways. Either the meta info shows
      // multiple pages, or there is a hasMultiplePages property set on
      // the results with value true.
      if (filters.meta) {
        this.searchEnabled = filters.meta.pagination.pages > 1;
      } else {
        this.searchEnabled = filters.hasMultiplePages === true;
      }
    });
  }

  @action
  onSelect(event) {
    this.selectedFilterId = event.target.value;
  }

  @action
  onSearchInput(event) {
    this.searchText = event.target.value;

    this.updateOptions().then((filters) => {
      // Look through the filter options to find a filter with a name that
      // matches the search field.
      let matchingFilter = filters.find(
        (filter) => filter.name === this.searchText
      );

      if (matchingFilter) {
        this.selectedFilterId = matchingFilter.id;
      } else {
        this.selectedFilterId = null;
      }
    });
  }
}
