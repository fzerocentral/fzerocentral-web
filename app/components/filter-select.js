import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getFormField } from "../utils/forms";


export default class FilterSelectComponent extends Component {}


/* For some reason, it felt easier to write component-related functionality
 in a separate class from the component itself. */
export class FilterSelectControl {

  @tracked searchEnabled;

  constructor(
      formId, baseFieldName, getOptions,
      {hasEmptyOption = false, initialFilter = null} = {}) {
    this.formId = formId;
    this.baseFieldName = baseFieldName;
    this.getOptions = getOptions;
    this.hasEmptyOption = hasEmptyOption;
    this.initialFilter = initialFilter;

    this.searchEnabled = false;
  }

  get form() {
    return document.getElementById(this.formId);
  }
  get hiddenField() {
    return getFormField(this.form, `${this.baseFieldName}-hidden`);
  }
  get selectField() {
    return getFormField(this.form, `${this.baseFieldName}-select`);
  }
  get mainField() {
    if (this.searchEnabled) {
      return this.hiddenField;
    }
    else {
      return this.selectField;
    }
  }
  get textField() {
    return getFormField(this.form, `${this.baseFieldName}-text`);
  }
  get selectedFilterId() {
    return this.mainField.value;
  }

  /**
   * Gets the filter options as an Ember-Data Promise. Implemented function
   * should be passed into this class's constructor.
   * @param {string} searchText
   * @returns {Promise}
   */
  getOptions(searchText) {    // eslint-disable-line no-unused-vars
    throw "Not implemented";
  }

  updateOptions() {
    let searchText = '';
    if (this.searchEnabled) {
      searchText = this.textField.value;
    }

    let getOptionsPromise = this.getOptions(searchText);

    return getOptionsPromise.then((filters) => {
      // Update DOM (sorry, Ember purists)

      // Fill the datalist options, for the searchEnabled case
      let datalist = this.textField.list;
      datalist.replaceChildren();
      filters.forEach((filter) => {
        let option = document.createElement('option');
        option.setAttribute('value', filter.name);
        datalist.appendChild(option);
      });

      // Fill the select options, for the non-search case
      let select = this.selectField;
      select.replaceChildren();
      if (this.hasEmptyOption) {
        let option = document.createElement('option');
        option.setAttribute('value', '');
        option.textContent = '-----';
        select.appendChild(option);
      }
      filters.forEach((filter) => {
        let option = document.createElement('option');
        option.setAttribute('value', filter.id);
        option.textContent = filter.name;
        select.appendChild(option);
      });

      return filters;
    })
  }

  initializeOptions() {
    this.updateOptions().then((filters) => {
      // Set searchEnabled based on number of filters available.
      this.searchEnabled = filters.meta.pagination.pages > 1;
      // Set the initial value (defaults to null or undefined).
      this.setFilter(this.initialFilter);
    })
  }

  @action
  onTextInput() {
    // Update options, then update the hidden field value
    this.updateOptions().then((filters) => {
      // Look through the filter options to find a filter with a name that
      // matches the text field.
      let matchingFilter = filters.find(
        (filter) => filter.name === this.textField.value);

      if (matchingFilter) {
        // Assign that matching filter's ID to the real (hidden) field.
        this.mainField.value = matchingFilter.id;
      }
      else {
        this.mainField.value = null;
      }
    });
  }

  setFilter(filter) {
    if (!filter) {
      this.clearFilter();
      return;
    }

    if (this.searchEnabled) {
      this.textField.value = filter.name;
    }
    this.mainField.value = filter.id;
  }

  clearFilter() {
    if (this.searchEnabled) {
      this.textField.value = '';
    }
    this.mainField.value = null;
  }
}
