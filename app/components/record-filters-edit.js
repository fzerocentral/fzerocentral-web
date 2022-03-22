import Component from '@ember/component';
import EmberObject, { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  filters: null,
  filterGroups: null,
  store: service('store'),

  // This updates when filterGroups is set, or filters gets elements added,
  // removed, or replaced.
  @computed('filterGroups', 'filters.[]')
  get filtersPerGroup() {
    let obj = EmberObject.create();
    // One object entry per filter group. Default to null.
    this.get('filterGroups').forEach((filterGroup) => {
      obj.set(filterGroup.id, null);
    });
    // Fill in entries based on contents of `filters`. There should be at most
    // one filter per filter group.
    this.get('filters').forEach((filter) => {
      // The API records response must include related-objects `filters`
      // in order for this to work.
      obj.set(filter.get('filterGroup').get('id'), filter);
    });
    return obj;
  },

  @action
  onAnyFilterChange(groupId, filter) {
    // Update `filters`.
    // First remove any existing filter of this group.
    let inThisGroup = (f) => {
      return f.get('filterGroup').get('id') === groupId;
    };
    let indexInFilters = this.get('filters').indexOf(
      this.get('filters').find(inThisGroup));
    if (indexInFilters !== -1) {
      this.get('filters').removeAt(indexInFilters);
    }

    // Then add the passed filter, if it's not null/undefined/etc. (it could
    // be, if we cleared a selection).
    if (filter) {
      this.get('filters').pushObject(filter);
    }
  },
});
