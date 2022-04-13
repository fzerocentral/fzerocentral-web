import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { FilterSelectControl } from "../../components/filter-select";
import { errorDisplay } from "../../helpers/error-display";
import FilterModel from "../../models/filter";
import { getFormField, setFormError } from "../../utils/forms";


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
  @service nonEmberDataApi;

  @tracked isEditing = false;
  @tracked selectedFilterId = null;
  @tracked selectedFilter = null;
  @tracked incomingImplicationsPageNumber = 1;
  @tracked incomingImplications = null;
  @tracked outgoingImplicationsPageNumber = 1;
  @tracked outgoingImplications = null;
  @tracked recordCount = 0;

  FILTER_USAGE_TYPE_OPTIONS = FilterModel.USAGE_TYPE_OPTIONS;

  constructor(...args) {
    super(...args);

    this.newImplicationFilterSelect = new FilterSelectControl(
      'implication-create-form', 'filter',
      this.getNewImplicationTargetOptions.bind(this));
    this.deleteImplicationFilterSelect = new FilterSelectControl(
      'implication-delete-form', 'filter',
      this.getDeleteImplicationTargetOptions.bind(this));
  }

  @action
  updateSelectedFilterId(filterId) {
    this.selectedFilterId = filterId;
    this.selectedFilter = this.store.findRecord('filter', filterId);

    if (this.isEditing) {
      // Re-initialize editing state.
      this.filterEditError = "";
      this.stopEditingFilter();
    }

    // Update filter info which needs API calls.
    this.incomingImplicationsPageNumber = 1;
    this.updateIncomingImplications();
    this.outgoingImplicationsPageNumber = 1;
    this.updateOutgoingImplications();
    this.updateSelectedFilterRecordCount();
    // TODO: Run these updates once they won't cause errors for accessing stuff that's not in DOM yet.
    // this.newImplicationFilterSelect.updateOptions();
    // this.deleteImplicationFilterSelect.updateOptions();
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
  updateIncomingImplicationsPageNumber(pageNumber) {
    this.incomingImplicationsPageNumber = pageNumber;
    this.updateIncomingImplications();
  }

  updateIncomingImplications() {
    this.incomingImplications = this.store.query('filter', {
      implies_filter_id: this.selectedFilterId,
      'page[number]': this.incomingImplicationsPageNumber,
    });
  }

  @action
  updateOutgoingImplicationsPageNumber(pageNumber) {
    this.outgoingImplicationsPageNumber = pageNumber;
    this.updateOutgoingImplications();
  }

  updateOutgoingImplications() {
    this.outgoingImplications = this.store.query('filter', {
      implied_by_filter_id: this.selectedFilterId,
      'page[number]': this.outgoingImplicationsPageNumber,
    });
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

  /* Filter creation */

  get filterCreateForm() {
    return document.getElementById('filter-create-form');
  }

  getNewFilterArgs() {
    let form = this.filterCreateForm;
    let args = {
      name: getFormField(form, 'name').value,
      usageType: getFormField(form, 'usage-type').value,
      filterGroup: this.model.filterGroup,
    };
    if (this.model.filterGroup.kind === 'numeric') {
      // Numeric filters are always choosable, not implied
      args.usageType = 'choosable';
      args.numericValue = getFormField(form, 'numeric-value').value;
    }
    return args;
  }
  clearNewFilterFields() {
    let form = this.filterCreateForm;
    getFormField(form, 'name').value = '';
    if (this.model.filterGroup.kind === 'numeric') {
      getFormField(form, 'numeric-value').value = '';
    }
  }

  @action
  createFilter() {
    let newFilter = this.store.createRecord('filter', this.getNewFilterArgs());

    newFilter.save()
    .then(() => {
      // Success; clear the error message.
      setFormError(this.filterCreateForm, "");
      // Clear the new-filter form fields.
      this.clearNewFilterFields();
      // Refresh the model to update the filter lists.
      this.send('refreshModel');
    }, (response) => {
      // Error callback
      setFormError(this.filterCreateForm, response.errors[0]);
      // Remove the record from the store
      newFilter.rollbackAttributes();
    });
  }

  get hasNumericValue() {
    return this.model.filterGroup.get('kind') === 'numeric';
  }

  /* Implication creation */

  // TODO: This should not include filters already implied by the selected filter
  getNewImplicationTargetOptions(searchText) {
    return this.store.query('filter', {
      filter_group_id: this.model.filterGroup.id,
      usage_type: 'implied',
      name_search: searchText,
    });
  }

  @action
  createImplication() {
    let form = this.newImplicationFilterSelect.form;
    let targetId = this.newImplicationFilterSelect.selectedFilterId;

    if (!targetId) {
      setFormError(
        form, "Please select the target filter for the implication relation.");
      return;
    }

    this.nonEmberDataApi.createFilterImplication(
      this.selectedFilterId, targetId)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      setFormError(form, "");
      // Reset the target-filter field(s).
      this.newImplicationFilterSelect.clearFilter();
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      setFormError(form, error.message);
    });
  }

  /* Implication deletion */

  getDeleteImplicationTargetOptions(searchText) {
    return this.store.query('filter', {
      implied_by_filter_id: this.selectedFilterId,
      name_search: searchText,
    });
  }

  @action
  deleteImplication() {
    let form = this.deleteImplicationFilterSelect.form;
    let targetId = this.deleteImplicationFilterSelect.selectedFilterId;

    if (!targetId) {
      setFormError(form, "Please select an implication to delete.");
      return;
    }

    this.nonEmberDataApi.deleteFilterImplication(
      this.selectedFilterId, targetId)
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      // Success; clear the error message.
      setFormError(form, "");
      // Reset the target-filter field(s).
      this.deleteImplicationFilterSelect.clearFilter();
      // Refresh the model to update the implications.
      this.send('refreshModel');
    })
    .catch(error => {
      setFormError(form, error.message);
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

  @action
  saveFilterEdits() {
    this.selectedFilter.name = this.filterEditArgs.name;
    this.selectedFilter.numericValue = this.filterEditArgs.numericValue;

    this.selectedFilter.save()
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
    document.getElementById('edit-filter-name').value =
      this.selectedFilter.get('name');
    if (this.hasNumericValue) {
      document.getElementById('edit-filter-numeric-value').value =
        this.selectedFilter.get('numericValue');
    }
  }

  @action
  stopEditingFilter() {
    this.isEditing = false;
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
