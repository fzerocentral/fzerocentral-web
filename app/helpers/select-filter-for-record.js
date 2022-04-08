import { helper } from '@ember/component/helper';

export function selectFilterForRecord([record]) {
  return (filterGroup, filter) => {
    // Update `filters`.
    // First remove any existing filter of this group.
    let indexInFilters = record.filters.indexOf(
      record.filters.find(f => f.filterGroup.get('id') === filterGroup.id));
    if (indexInFilters !== -1) {
      record.filters.removeAt(indexInFilters);
    }

    // Then add the passed filter, if it's not null/undefined/etc. (it could
    // be, if we cleared a selection).
    if (filter) {
      record.filters.pushObject(filter);
    }
  };
}

export default helper(selectFilterForRecord);
