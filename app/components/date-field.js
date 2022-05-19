import { action } from '@ember/object';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class DateFieldComponent extends Component {
  @action
  onchange(event) {
    let dateInputText = event.target.value;
    // String -> Date
    let dateFromInput = dayjs(dateInputText, [
      'YYYY-MM-DD',
      'YYYY-MM-DD HH:mm',
      'YYYY-MM-DD HH:mmZ',
    ]);

    if (dateFromInput.isValid()) {
      this.args.updateDateValue(dateFromInput.toDate());
    } else {
      // Simply do not update the date value. Maybe can think of more helpful
      // behavior here later.
    }
  }
}
