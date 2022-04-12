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

  @tracked isEditing = false;
  @tracked newImplicationTargetOptions = A([]);
  @tracked deleteImplicationTargetOptions = A([]);

  FILTER_USAGE_TYPE_OPTIONS = FilterModel.USAGE_TYPE_OPTIONS;

  getFormField(form, fieldName) {
    return Array.from(form.elements).find(
      (element) => element.name === fieldName);
  }
  setFormError(form, error) {
    form.querySelector('.error-message').textContent = errorDisplay([error]);
  }

  /* Filter creation */

  get filterCreateForm() {
    return document.getElementById('filter-create-form');
  }

  getNewFilterArgs() {
    let form = this.filterCreateForm;
    let args = {
      name: this.getFormField(form, 'name').value,
      usageType: this.getFormField(form, 'usage-type').value,
      filterGroup: this.model.filterGroup,
    };
    if (this.model.filterGroup.kind === 'numeric') {
      // Numeric filters are always choosable, not implied
      args.usageType = 'choosable';
      args.numericValue = this.getFormField(form, 'numeric-value').value;
    }
    return args;
  }
  clearNewFilterFields() {
    let form = this.filterCreateForm;
    this.getFormField(form, 'name').value = '';
    if (this.model.filterGroup.kind === 'numeric') {
      this.getFormField(form, 'numeric-value').value = '';
    }
  }

  @action
  createFilter() {
    let newFilter = this.store.createRecord('filter', this.getNewFilterArgs());

    newFilter.save()
    .then(() => {
      // Success; clear the error message.
      this.setFormError(this.filterCreateForm, "");
      // Clear the new-filter form fields.
      this.clearNewFilterFields();
      // Refresh the model to update the filter lists.
      this.send('refreshModel');
    }, (response) => {
      // Error callback
      this.setFormError(this.filterCreateForm, response.errors[0]);
      // Remove the record from the store
      newFilter.rollbackAttributes();
    });
  }

  get hasNumericValue() {
    return this.model.selectedFilter.filterGroup.get('kind') === 'numeric';
  }

  /* Implication creation */

  get implicationCreateForm() {
    return document.getElementById('implication-create-form');
  }

  @action
  updateNewImplicationTargetOptions() {
    let textField = this.getFormField(
      this.implicationCreateForm, 'filter-text');

    // Update options
    this.newImplicationTargetOptions = this.store.query('filter', {
      filter_group_id: this.model.filterGroup.id,
      name_search: textField.value,
    });

    // Return promise
    return this.newImplicationTargetOptions;
  }

  @action
  createImplication() {
    let form = this.implicationCreateForm;
    let newImplicationTargetId = this.getFormField(form, 'filter').value;

    if (!newImplicationTargetId) {
      this.setFormError(
        form, "Please select the target filter for the implication relation.");
      return;
    }

    this.nonEmberDataApi.createFilterImplication(
      this.model.selectedFilter.id, newImplicationTargetId)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      this.setFormError(form, "");
      // Reset the target-filter field(s).
      this.getFormField(form, 'filter-text').value = '';
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      this.setFormError(form, error.message);
    });
  }

  /* Implication deletion */

  get implicationDeleteForm() {
    return document.getElementById('implication-delete-form');
  }

  @action
  updateDeleteImplicationTargetOptions() {
    let textField = this.getFormField(
      this.implicationDeleteForm, 'filter-text');

    // Update options
    this.deleteImplicationTargetOptions = this.store.query('filter', {
      implied_by_filter_id: this.selectedFilterId,
      name_search: textField.value,
    });

    // Return promise
    return this.deleteImplicationTargetOptions;
  }

  @action
  deleteImplication() {
    let form = this.implicationDeleteForm;
    let deleteImplicationTargetId = this.getFormField(form, 'filter').value;

    if (!deleteImplicationTargetId) {
      this.setFormError(form, "Please select an implication to delete.");
      return;
    }

    this.nonEmberDataApi.deleteFilterImplication(
      this.model.selectedFilter.id, deleteImplicationTargetId)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      this.setFormError(form, "");
      // Reset the target-filter field(s).
      this.getFormField(form, 'filter-text').value = '';
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      this.setFormError(form, error.message);
    });
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

  get recordCount() {
    if (this.model.sampleRecordsOfFilter === null) {return null;}

    // The record count can be retrieved from the pagination headers of
    // sampleRecords. We're not interested in the records themselves.
    return this.model.sampleRecordsOfFilter.meta.pagination.count;
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
}
