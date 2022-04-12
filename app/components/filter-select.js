import { A } from '@ember/array';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getFormField } from "../utils/forms";


export default class FilterSelectComponent extends Component {}


/* For some reason, it felt easier to write component-related functionality
 in a separate class from the component itself. */
export class FilterSelectControl {

  @tracked options;

  constructor(formId, fieldName, getOptions) {
    this.formId = formId;
    this.fieldName = fieldName;
    this.getOptions = getOptions;
    this.options = A([]);
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
   * should be passed into the constructor.
   * @param {string} searchText
   * @returns {Promise}
   */
  getOptions(searchText) {    // eslint-disable-line no-unused-vars
    throw "Not implemented";
  }

  @action
  onTextInput() {
    // Update options
    this.options = this.getOptions(this.textField.value);

    // When options update, update the hidden field value
    this.options.then((options) => {
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
    this.textField.value = '';
  }
}
