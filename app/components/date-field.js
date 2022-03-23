import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class DateFieldComponent extends Component {
  @tracked dateValue = this.args.initialDateValue || null;

  // Date -> String
  dateToStr(date) {
    if (date === null) {
      return "";
    }
    return moment(date).format();
  }

  get dateDisplay() {
    return this.dateToStr(this.dateValue);
  }

  get initialDateInputText() {
    return this.dateToStr(this.args.initialDateValue || null);
  }

  @action
  onchange(event) {
    let dateInputText = event.target.value;
    // String -> Date
    let momentDate = moment(
      dateInputText,
      ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm', 'YYYY-MM-DDTHH:mm:ss',
       'YYYY-MM-DDTHH:mmZ', 'YYYY-MM-DDTHH:mm:ssZ']);

    if (momentDate.isValid()) {
      this.dateValue = momentDate.toDate();
      this.args.updateDateValue(this.dateValue);
    }
    else {
      // Simply do not update the date value. Maybe can think of more helpful
      // behavior here later.
    }
  }
}
