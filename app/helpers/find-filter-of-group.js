import { helper } from '@ember/component/helper';

export function findFilterOfGroup([filters, filterGroupId]) {
  return filters.find((f) => {
    return f.filter_group_id.toString() === filterGroupId;
  });
}

export default helper(findFilterOfGroup);
