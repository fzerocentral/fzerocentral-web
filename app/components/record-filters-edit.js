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
    this.filterGroups.forEach((filterGroup) => {
      obj.set(filterGroup.id, null);
    });
    // Fill in entries based on contents of `filters`. There should be at most
    // one filter per filter group.
    this.filters.forEach((filter) => {
      // TODO: This only works if the Rails records controller includes
      // related-objects `filters`. We need to actually specify those related
      // objects via an `include` parameter, which should be recognized
      // on the Rails side.
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
    let indexInFilters = this.filters.indexOf(
      this.filters.find(inThisGroup));
    if (indexInFilters !== -1) {
      this.filters.removeAt(indexInFilters);
    }

    // Then add the passed filter, if it's not null/undefined/etc. (it could
    // be, if we cleared a selection).
    if (filter) {
      this.filters.pushObject(filter);
    }
  },
});
