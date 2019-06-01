import { helper } from '@ember/component/helper';

export function not([arg]/*, hash*/) {
  return !arg;
}

export default helper(not);
