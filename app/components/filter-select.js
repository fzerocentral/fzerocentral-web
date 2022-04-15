import { A } from '@ember/array';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getFormField } from "../utils/forms";


export default class FilterSelectComponent extends Component {

  /**
   * If a select element is used, this determines whether or not there is
   * an empty choice.
   * Defaults to false.
   * @returns {boolean}
   */
  get hasEmptyOption() {
    return this.args.hasEmptyOption ?? false;
  }
}


/* For some reason, it felt easier to write component-related functionality
 in a separate class from the component itself. */
export class FilterSelectControl {

  @tracked options;
  @tracked searchEnabled;

  constructor(formId, fieldName, getOptions, searchEnabled=false) {
    this.formId = formId;
    this.fieldName = fieldName;
    this.getOptions = getOptions;
    this.options = A([]);
    this.searchEnabled = searchEnabled;
  }

  get form() {
    return document.getElementById(this.formId);
  }
  get mainField() {
    return getFormField(this.form, this.fieldName);
  }
  get textField() {
    return getFormField(this.form, `${this.fieldName}-text`);
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

    this.options = this.getOptions(searchText);

    // Return promise
    return this.options;
  }

  @action
  onTextInput() {
    // Update options, then update the hidden field value
    this.updateOptions().then((options) => {
      // Look through the filter options to find a filter with a name that
      // matches the text field.
      let matchingFilter = options.find(
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

  clearFilter() {
    if (this.searchEnabled) {
      // This clears both the text and main fields
      // (the latter via onTextInput()).
      this.textField.value = '';
    }
    else {
      // There's only a main field
      this.mainField.value = null;
    }
  }
}
