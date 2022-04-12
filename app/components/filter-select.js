import { action } from '@ember/object';
import Component from '@glimmer/component';


export default class FilterSelectComponent extends Component {

  @action
  onTextInput(event) {
    let textField = event.target;
    let promise = this.args.updateOptions(event.target);

    // When options update, update the hidden field value
    promise.then((options) => {
      // Look through the filter options to find a filter with a name that
      // matches the text field.
      let matchingFilter = options.find((filter) => filter.name === textField.value);

      let hiddenField = document.getElementById(textField.dataset.hiddenField);
      if (matchingFilter) {
        // Assign that matching filter's ID to the real (hidden) field.
        hiddenField.value = matchingFilter.id;
      }
      else {
        hiddenField.value = null;
      }
    });
  }
}
