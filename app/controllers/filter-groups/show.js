import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { errorDisplay } from "../../helpers/error-display";
import FilterModel from "../../models/filter";

export default class FilterGroupsShowController extends Controller {
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
  @service nonEmberDataApi;

  @tracked newFilterUsageType = null;
  @tracked isEditing = false;
  @tracked newImplicationTargetFilter = null;
  @tracked implicationDeletionTargetFilter = null;
  @tracked newImplicationTargetOptions = A([]);

  FILTER_USAGE_TYPE_OPTIONS = FilterModel.USAGE_TYPE_OPTIONS;

  get filterCreateError() {
    return document.getElementById('filter-create-error').textContent;
  }
  set filterCreateError(error) {
    document.getElementById('filter-create-error').textContent =
      errorDisplay([error]);
  }

  get hasNumericValue() {
    return this.model.selectedFilter.filterGroup.get('kind') === 'numeric';
  }

  get filterDeleteError() {
    return document.getElementById('filter-delete-error').textContent;
  }
  set filterDeleteError(error) {
    document.getElementById('filter-delete-error').textContent =
      errorDisplay([error]);
  }

  get filterEditArgs() {
    let args = {};
    args.name = document.getElementById('edit-filter-name').value;
    if (this.hasNumericValue) {
      args.numericValue =
        document.getElementById('edit-filter-numeric-value').value;
    }
    return args;
  }

  get filterEditError() {
    return document.getElementById('filter-edit-error').textContent;
  }
  set filterEditError(error) {
    document.getElementById('filter-edit-error').textContent =
      errorDisplay([error]);
  }

  get implicationCreateError() {
    return document.getElementById('implication-create-error').textContent;
  }
  set implicationCreateError(error) {
    document.getElementById('implication-create-error').textContent =
      errorDisplay([error]);
  }

  get implicationDeleteError() {
    return document.getElementById('implication-delete-error').textContent;
  }
  set implicationDeleteError(error) {
    document.getElementById('implication-delete-error').textContent =
      errorDisplay([error]);
  }

  get recordCount() {
    if (this.model.sampleRecordsOfFilter === null) {return null;}

    // The record count can be retrieved from the pagination headers of
    // sampleRecords. We're not interested in the records themselves.
    return this.model.sampleRecordsOfFilter.meta.pagination.count;
  }

  getNewFilterArgs() {
    let args = {
      name: document.getElementById('new-filter-name').value,
      usageType: this.newFilterUsageType,
      filterGroup: this.model.filterGroup,
    };
    if (this.model.filterGroup.kind === 'numeric') {
      // Numeric filters are always choosable, not implied
      args.usageType = 'choosable';
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
  doCreateImplicationNameSearch(searchText) {
    return this.store.query('filter', {
      filter_group_id: this.model.filterGroup.id,
      name_search: searchText,
    });
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
  selectFilter(filterId) {
    this.selectedFilterId = filterId;

    // Re-initialize some component state.
    this.filterEditError = "";
    this.stopEditingFilter();
  }

  @action
  saveFilterEdits() {
    let selectedFilter = this.model.selectedFilter;

    selectedFilter.name = this.filterEditArgs.name;
    selectedFilter.numericValue = this.filterEditArgs.numericValue;

    selectedFilter.save()
    .then(() => {
      // Success; clear the error message.
      this.filterEditError = "";
      // Close the edit form.
      this.stopEditingFilter();
      // Refresh the model to update the filter lists.
      this.send('refreshModel');
    }, (response) => {
      // Error callback
      this.filterEditError = response.errors[0];
    });
  }

  @action
  startEditingFilter() {
    this.isEditing = true;

    // Populate fields
    let selectedFilter = this.model.selectedFilter;
    document.getElementById('edit-filter-name').value =
      selectedFilter.get('name');
    if (this.hasNumericValue) {
      document.getElementById('edit-filter-numeric-value').value =
        selectedFilter.get('numericValue');
    }
  }

  @action
  stopEditingFilter() {
    this.isEditing = false;
  }

  @action
  deleteFilter() {
    let filterToDelete = this.model.selectedFilter;

    // Clear the error message.
    this.filterDeleteError = "";
    // Clear the active filter ID. This must be done before deletion, or
    // the model will make a query with the deleted filter ID, causing an
    // error.
    this.selectedFilterId = null;

    filterToDelete.destroyRecord()
    .then(() => {
      // Success.
    }, (response) => {
      // Error callback.
      // Set the active filter ID again.
      this.selectedFilterId = filterToDelete.id;
      // Set error message.
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

    this.nonEmberDataApi.createFilterImplication(
      this.model.selectedFilter.id, this.newImplicationTargetFilter.id)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      this.implicationCreateError = "";
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
      this.implicationDeleteError = "";
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
