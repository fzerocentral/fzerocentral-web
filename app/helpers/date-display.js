import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

export default helper(function dateDisplay(positional /*, named*/) {
  let [date, displayType] = positional;

  if (!date) {
    return '';
  }

  if (displayType === 'datetime') {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  } else if (displayType === 'timezone') {
    return dayjs(date).format('YYYY-MM-DD HH:mmZ');
  }

  return 'Unrecognized date display type';
});
