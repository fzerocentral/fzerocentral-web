import { A } from '@ember/array';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    let filterGroup = this.get('filterGroup');
    this.set('current', null);

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
    onFilterChange(parentOnFilterChange, filter) {
      // Set the filter state of the parent (this function was passed
      // here by the parent)
      parentOnFilterChange(filter);
      // Set this component's select-box state
      this.set('current', filter);
    }
  }
});
