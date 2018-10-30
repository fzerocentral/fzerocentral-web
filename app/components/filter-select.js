import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    let filterGroup = this.get('filterGroup');

    // Get filters of this filter group
    let filtersPromise = this.get('store').query(
      'filter', {filter_group_id: filterGroup.id});

    filtersPromise.then((filters) => {
      this.set('filterOptions', A([]));
      filters.forEach((filter) => {
        this.get('filterOptions').pushObject(filter);
      });

      return true;
    });
  },

  actions: {
    onFilterChange() {
      this.onFilterChange(...arguments);
    },
  },
  onFilterChange() {
    throw new Error('onFilterChange must be provided');
  },
});
