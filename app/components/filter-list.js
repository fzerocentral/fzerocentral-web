import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  filterGroupId: null,
  filtersLastUpdated: null,
  pageNumber: 1,
  searchText: '',
  store: service('store'),
  usageType: null,

  filters: computed('filterGroupId', 'filtersLastUpdated', 'pageNumber', 'searchText', 'usageType', function() {
    let args = {};

    let filterGroupId = this.get('filterGroupId');
    if (filterGroupId === null) { return null; }
    args['filter_group_id'] = filterGroupId;

    args['page'] = this.get('pageNumber');

    let usageType = this.get('usageType');
    if (usageType !== null) {
      args['usage_type'] = usageType;
    }

    let searchText = this.get('searchText');
    if (searchText !== '') {
      args['name_search'] = searchText;
    }

    return this.get('store').query('filter', args);
  }),

  // TODO: If you're not on page 1 and you type some searchText, the page
  // number won't reset, so the results may appear blank. It's not that
  // intrusive, but would be nice to fix.

  actions: {
    updateSelectedFilterId() {
      this.updateSelectedFilterId(...arguments);
    },
  },

  updateSelectedFilterId() {
    throw new Error('updateSelectedFilterId must be provided');
  },
});
