import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    let filterGroups = this.get('filterGroups');

    filterGroups.forEach((filterGroup) => {
      // Push the filterGroupHash now, not later, to ensure correct order of
      // the filterGroupHashes.
      let notSpecifiedFilter = {model: null, name: "(Not specified)"};
      this.get('filterGroupHashes').pushObject({
        groupId: filterGroup.get('id'),
        name: filterGroup.get('name'),
        filters: [],
        currentFilter: notSpecifiedFilter});

      // This'll help retrieve the hash later.
      let filterGroupHashIndex = this.get('filterGroupHashes').length - 1;
      let updateCallback = this.updateFilterGroupHash.bind(
        this, filterGroupHashIndex);

      let filtersPromise = this.get('store').query(
        'filter', {filter_group_id: filterGroup.id});
      filtersPromise.then(updateCallback);

      return true;
    });
  },

  updateFilterGroupHash(filterGroupHashIndex, filters) {
    // filters consists of the filter choices for this filter group.
    // We'll add the not-specified choice alongside those.
    // We can't add directly to a collection of filters, so we create a
    // new structure, filterHashes.
    let notSpecifiedFilter = {model: null, name: "(Not specified)"};
    let filterHashes = [];
    filters.forEach((filter) => {
      filterHashes.push({model: filter, name: filter.get('name')});
    });
    filterHashes.push(notSpecifiedFilter);

    let existingFilterGroupHash =
      this.get('filterGroupHashes').objectAt(filterGroupHashIndex);
    // Make an object copy, because directly modifying an Ember array
    // property's element is not allowed
    let newFilterGroupHash = Object.assign({}, existingFilterGroupHash);
    newFilterGroupHash.filters = filterHashes;

    // TODO: When editing an existing record, this should be initialized
    // to the previously-chosen filter if there is one.
    //newFilterGroupHash.currentFilter = record.filter;

    this.get('filterGroupHashes').replace(
      filterGroupHashIndex, 1, [newFilterGroupHash]);
  },
});
