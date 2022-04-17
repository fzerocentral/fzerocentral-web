import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class FilterGroupsShowController extends Controller {
  @service nonEmberDataApi;
  @service store;

  @tracked model;
  @tracked selectedFilterId = null;
  @tracked selectedFilter = null;
  @tracked choosableFilters = null;
  @tracked choosableFiltersNameSearch = '';
  @tracked choosableFiltersPage = 1;
  @tracked impliedFilters = null;
  @tracked impliedFiltersNameSearch = '';
  @tracked impliedFiltersPage = 1;

  @tracked implications = null;
  @tracked implicationsPage = 1;
  @tracked recordCount = 0;

  @action
  updateSelectedFilterId(filterId) {
    this.selectedFilterId = filterId;
    if (filterId === null) {
      this.selectedFilter = null;
      return;
    }

    this.selectedFilter = this.store.findRecord('filter', filterId);

    // Refresh filter info.
    this.selectedFilter.then(() => {
      this.implicationsPage = 1;
      this.updateImplications();
    });
    this.updateSelectedFilterRecordCount();
  }

  updateChoosableFilters() {
    this.choosableFilters = this.store.query('filter', {
      filter_group_id: this.model.filterGroup.id,
      name_search: this.choosableFiltersNameSearch,
      'page[number]': this.choosableFiltersPage,
      usage_type: 'choosable',
    });
  }

  updateImpliedFilters() {
    this.impliedFilters = this.store.query('filter', {
      filter_group_id: this.model.filterGroup.id,
      name_search: this.impliedFiltersNameSearch,
      'page[number]': this.impliedFiltersPage,
      usage_type: 'implied',
    });
  }

  @action
  updateChoosableSearchText(searchText) {
    this.choosableFiltersNameSearch = searchText;
    this.updateChoosableFilters();
  }

  @action
  updateImpliedSearchText(searchText) {
    this.impliedFiltersNameSearch = searchText;
    this.updateImpliedFilters();
  }

  @action
  updateChoosablePage(pageNumber) {
    this.choosableFiltersPage = pageNumber;
    this.updateChoosableFilters();
  }

  @action
  updateImpliedPage(pageNumber) {
    this.impliedFiltersPage = pageNumber;
    this.updateImpliedFilters();
  }

  @action
  updateImplicationsPage(pageNumber) {
    this.implicationsPage = pageNumber;
    this.updateImplications();
  }

  updateImplications() {
    if (this.selectedFilter.get('usageType') === 'choosable') {
      this.implications = this.store.query('filter', {
        implied_by_filter_id: this.selectedFilterId,
        'page[number]': this.implicationsPage,
      });
    }
    else {
      this.implications = this.store.query('filter', {
        implies_filter_id: this.selectedFilterId,
        'page[number]': this.implicationsPage,
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

  set filterDeleteError(error) {
    document.getElementById('filter-delete-error').textContent = error;
  }

  @action
  deleteFilter() {
    this.nonEmberDataApi.deleteFilter(this.selectedFilterId)
    .then(data => {
      if ('errors' in data) {
        let error = data.errors[0];
        throw new Error(error.detail);
      }

      // Success.
      // De-select the filter.
      this.updateSelectedFilterId(null);
      this.filterDeleteError = "";
      // Refresh filter lists.
      this.updateChoosableFilters();
      this.updateImpliedFilters();
    })
    .catch(error => {
      this.filterDeleteError = error.message;
    });
  }
}
