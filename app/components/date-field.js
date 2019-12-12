import Component from '@ember/component';
import { action, computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
  dateInput: "",
  dateValue: null,

  // Date -> String
  @computed('dateValue')
  get dateStr() {
    let value = this.get('dateValue');
    if (value === null || value === undefined) {
      return "";
    }
    return moment(value).format();
  },

  @action
  onchange() {
    // String -> Date
    let momentDate = moment(
      this.get('dateInput'),
      ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DDTHH:mm:ssZ']);
    if (momentDate.isValid()) {
      this.set('dateValue', momentDate.toDate());
    }
    else {
      // If not valid, trigger a reset of dateStr
      this.set('dateValue', this.get('dateValue'));
    }

    // Reset dateInput. It's not used for displaying the date after it's
    // entered. That is, we treat dateInput kind of as if it were part of a
    // pop-up prompt.
    this.set('dateInput', "");
  }
});
