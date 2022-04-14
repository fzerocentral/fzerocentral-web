import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { errorDisplay } from "../../helpers/error-display";


export default class FilterGroupsShowController extends Controller {
  queryParams = [
    'choosable_filters_name_search',
    'choosable_filters_page',
    'implied_filters_name_search',
    'implied_filters_page',
  ];

  @tracked choosable_filters_name_search = '';
  @tracked choosable_filters_page = 1;
  @tracked implied_filters_name_search = '';
  @tracked implied_filters_page = 1;

  @tracked model;

  @service store;

  @tracked selectedFilterId = null;
  @tracked selectedFilter = null;
  @tracked implicationsPageNumber = 1;
  @tracked implications = null;
  @tracked recordCount = 0;

  @action
  updateSelectedFilterId(filterId) {
    this.selectedFilterId = filterId;
    this.selectedFilter = this.store.findRecord('filter', filterId);

    // Update filter info which needs API calls.
    this.implicationsPageNumber = 1;
    this.updateImplications();
    this.updateSelectedFilterRecordCount();
  }

  @action
  updateChoosableSearchText(inputElement) {
    this.choosable_filters_name_search = inputElement.target.value;
  }

  @action
  updateImpliedSearchText(inputElement) {
    this.implied_filters_name_search = inputElement.target.value;
  }

  @action
  updateChoosablePage(pageNumber) {
    this.choosable_filters_page = pageNumber;
  }

  @action
  updateImpliedPage(pageNumber) {
    this.implied_filters_page = pageNumber;
  }

  @action
  updateImplicationsPageNumber(pageNumber) {
    this.implicationsPageNumber = pageNumber;
    this.updateImplications();
  }

  updateImplications() {
    if (this.selectedFilter.usageType === 'choosable') {
      this.implications = this.store.query('filter', {
        implied_by_filter_id: this.selectedFilterId,
        'page[number]': this.implicationsPageNumber,
      });
    }
    else {
      this.implications = this.store.query('filter', {
        implies_filter_id: this.selectedFilterId,
        'page[number]': this.implicationsPageNumber,
      });
    }
  }

  updateSelectedFilterRecordCount() {
    this.store.query(
      'record', {filters: this.selectedFilterId, 'page[size]': 1}
    )
    .then((records) => {
      // The record count can be retrieved from the pagination headers.
      // We're not interested in the records themselves.
      this.recordCount = records.meta.pagination.count;
    })
  }

  get filterDeleteError() {
    return document.getElementById('filter-delete-error').textContent;
  }
  set filterDeleteError(error) {
    document.getElementById('filter-delete-error').textContent =
      errorDisplay([error]);
  }

  @action
  deleteFilter() {
    let filterToDelete = this.selectedFilter;

    // Clear the error message.
    this.filterDeleteError = "";
    // Clear the active filter ID. This must be done before deletion, or
    // the model will make a query with the deleted filter ID, causing an
    // error.
    this.selectFilter(null);

    filterToDelete.destroyRecord()
    .then(() => {
      // Success.
    }, (response) => {
      // Error callback.
      // Set the active filter ID again.
      this.selectFilter(filterToDelete.id);
      // Set error message.
      this.filterDeleteError = response.errors[0];
    });
  }
}
