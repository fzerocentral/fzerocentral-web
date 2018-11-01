import { helper } from '@ember/component/helper';

export function findFilterOfGroup(params) {
  let [filters, filterGroupId] = params;
  return filters.find((f) => {
    return f.get('filterGroup').get('id') === filterGroupId;});
}

export default helper(findFilterOfGroup);
