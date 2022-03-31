import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { errorDisplay } from "../../helpers/error-display";
import FilterModel from "../../models/filter";

export default class FilterGroupsShowController extends Controller {
  // TODO: Standardize the naming format
  queryParams = [
    'choosable_filters_name_search',
    'choosable_filters_page',
    'implied_filters_name_search',
    'implied_filters_page',
    'incomingImplicationsPageNumber',
    'outgoingImplicationsPageNumber',
    'selectedFilterId',
  ];

  @tracked choosable_filters_name_search = '';
  @tracked choosable_filters_page = 1;
  @tracked implied_filters_name_search = '';
  @tracked implied_filters_page = 1;
  @tracked incomingImplicationsPageNumber = 1;
  @tracked outgoingImplicationsPageNumber = 1;
  @tracked selectedFilterId = null;

  @tracked model;

  @service store;

  @tracked newFilterUsageType = null;
  filterDeleteError = null;
  newImplicationTargetFilter = null;
  implicationCreateError = null;
  implicationDeletionTargetFilter = null;
  implicationDeleteError = null;

  FILTER_USAGE_TYPE_OPTIONS = FilterModel.USAGE_TYPE_OPTIONS;

  get filterCreateError() {
    return document.getElementById('filter-create-error').textContent;
  }
  set filterCreateError(error) {
    document.getElementById('filter-create-error').textContent =
      errorDisplay([error]);
  }

  getNewFilterArgs() {
    let args = {
      name: document.getElementById('new-filter-name').value,
      usageType: this.newFilterUsageType,
      filterGroup: this.model.filterGroup,
    };
    if (this.model.filterGroup.kind === 'numeric') {
      args.numericValue =
        document.getElementById('new-filter-numeric-value').value;
    }
    return args;
  }
  clearNewFilterFields() {
    document.getElementById('new-filter-name').value = '';
    this.newFilterUsageType = null;
    if (this.model.filterGroup.kind === 'numeric') {
      document.getElementById('new-filter-numeric-value').value = '';
    }
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
  doDeleteImplicationNameSearch(searchText) {
    return this.store.query('filter', {
      implied_by_filter_id: this.selectedFilterId,
      name_search: searchText,
    });
  }

  @action
  createFilter() {
    let newFilter = this.store.createRecord('filter', this.getNewFilterArgs());

    newFilter.save()
    .then(() => {
      // Success; clear the error message.
      this.filterCreateError = "";
      // Clear the new-filter form fields.
      this.clearNewFilterFields();
      // Refresh the model to update the filter lists.
      this.send('refreshModel');
    }, (response) => {
      // Error callback
      this.filterCreateError = response.errors[0];
      // Remove the record from the store
      newFilter.rollbackAttributes();
    });
  }

  @action
  editFilter(filterArgs) {
    let selectedFilterPromise = this.store.findRecord(
      'filter', this.selectedFilterId);

    return selectedFilterPromise.then(selectedFilter => {
      selectedFilter.set('name', filterArgs.name);
      selectedFilter.set('numericValue', filterArgs.numericValue);

      selectedFilter.save()
        .then(() => {
          // Success.
          // Refresh the model to update the filter lists.
          this.send('refreshModel');
          return null;
        }, (response) => {
          // Error callback
          return response.errors[0];
        });
    });
  }

  @action
  deleteFilter() {
    let selectedFilter = this.model.selectedFilter;

    selectedFilter.destroyRecord()
    .then(() => {
      // Success; clear the error message.
      this.filterDeleteError = null;
      // Clear the active filter ID.
      this.args.updateFilterId(null);
      // Refresh the model to update the filter lists.
      this.send('refreshModel');
    }, (response) => {
      // Error callback
      this.filterDeleteError = response.errors[0];
    });
  }

  @action
  createImplication() {
    if (this.newImplicationTargetFilter === null) {
      this.implicationCreateError =
        "Please select the target filter for the implication relation.";
      return;
    }

    let selectedFilter = this.model.selectedFilter;

    this.nonEmberDataApi.createFilterImplication(
      selectedFilter.id, this.newImplicationTargetFilter.id)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      this.implicationCreateError = null;
      // Reset the target-filter field.
      this.newImplicationTargetFilter = null;
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      this.implicationCreateError = error.message;
    });
  }

  @action
  deleteImplication() {
    if (this.implicationDeletionTargetFilter === null) {
      this.implicationDeleteError =
        "Please select an implication to delete.";
      return;
    }

    let selectedFilter = this.model.selectedFilter;

    this.nonEmberDataApi.deleteFilterImplication(
      selectedFilter.id, this.implicationDeletionTargetFilter.id)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      this.implicationDeleteError = null;
      // Reset the target-filter field.
      this.implicationDeletionTargetFilter = null;
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      this.implicationDeleteError = error.message;
    });
  }
}
