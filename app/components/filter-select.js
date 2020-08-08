import Component from '@ember/component';
import EmberObject, { action, computed } from '@ember/object';

export default Component.extend({
  filterGroup: null,
  filterUsageType: null,

  @computed('filterGroup', 'filterUsageType')
  get params() {
    let filterGroup = this.filterGroup;
    if (!filterGroup) {
      // This signals to data-power-select that we don't want a search to
      // take place.
      return null;
    }
    let params = EmberObject.create();
    params.set('filter_group_id', filterGroup.get('id'));
    params.set('usage_type', this.filterUsageType);
    return params;
  },

  @action
  onFilterChangeAction() {
    this.onFilterChange(...arguments);
  },

  onFilterChange() {
    throw new Error('onFilterChange must be provided');
  },
});
