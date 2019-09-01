import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  filterGroup: null,
  filterUsageType: null,

  params: computed('filterGroup', 'filterUsageType', function() {
    let filterGroup = this.get('filterGroup');
    if (!filterGroup) {
      // This signals to data-power-select that we don't want a search to
      // take place.
      return null;
    }
    let params = EmberObject.create();
    params.set('filter_group_id', filterGroup.get('id'));
    params.set('usage_type', this.get('filterUsageType'));
    return params;
  }),

  actions: {
    onFilterChange() {
      this.onFilterChange(...arguments);
    },
  },
  onFilterChange() {
    throw new Error('onFilterChange must be provided');
  },
});
