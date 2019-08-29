import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  filterGroupId: null,
  filtersLastUpdated: null,
  pageNumber: 1,
  store: service('store'),
  usageType: null,

  filters: computed('filterGroupId', 'filtersLastUpdated', 'pageNumber', 'usageType', function() {
    let args = {};

    let filterGroupId = this.get('filterGroupId');
    if (filterGroupId === null) { return null; }
    args['filter_group_id'] = filterGroupId;

    let pageNumber = this.get('pageNumber');
    args['page'] = pageNumber;

    let usageType = this.get('usageType');
    if (usageType !== null) {
      args['usage_type'] = usageType;
    }

    return this.get('store').query('filter', args);
  }),

  actions: {
    updateSelectedFilterId() {
      this.updateSelectedFilterId(...arguments);
    },
  },

  updateSelectedFilterId() {
    throw new Error('updateSelectedFilterId must be provided');
  },
});
