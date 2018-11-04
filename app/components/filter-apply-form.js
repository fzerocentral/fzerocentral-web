import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  appliedFiltersString: null,
  filterGroups: null,
  store: service('store'),

  appliedFilterSpecs: computed('appliedFiltersString', function() {
    let appliedFiltersString = this.get('appliedFiltersString');
    if (appliedFiltersString === null) {
      return A([]);
    }

    let appliedFilterStrings = appliedFiltersString.split(',');
    let appliedFilterSpecs = A([]);
    appliedFilterStrings.forEach((afString) => {
      let regexMatch = /([0-9]+)([a-zA-Z]*)/.exec(afString);
      if (regexMatch === null) {
        // TODO: Should somehow notify the user that an applied filter string
        // was invalid
        return;
      }
      appliedFilterSpecs.pushObject({
        filterId: regexMatch[1], typeSuffix: regexMatch[2]});
    });
    return appliedFilterSpecs;
  }),

  appliedFilters: computed('appliedFilterSpecs', 'filterGroups', function() {
    let filterIds = [];
    this.get('appliedFilterSpecs').forEach((afSpec) => {
      filterIds.push(afSpec.filterId);
    });
    let filtersPromise = this.get('store').query(
      'filter', {filter_ids: filterIds.join(',')});

    return DS.PromiseArray.create({
      promise: filtersPromise.then((filters) => {
        let appliedFilters = A([]);

        this.get('appliedFilterSpecs').forEach((afSpec) => {
          let filterId = afSpec.filterId;
          let typeSuffix = afSpec.typeSuffix;
          let filterInstance = filters.findBy('id', filterId);
          let filterName = filterInstance.get('name');
          let filterGroupName = filterInstance.get('filterGroup').get('name');
          let display = null;

          if (typeSuffix === '') {
            // No suffix; simple test for filter presence
            display = `${filterGroupName}: ${filterName}`;
          }
          else if (typeSuffix === 'n') {
            // Negation
            display = `${filterGroupName}: NOT ${filterName}`;
          }
          else if (typeSuffix === 'le') {
            // Less than or equal to, for numeric filters
            display = `${filterGroupName}: <= ${filterName}`;
          }
          else if (typeSuffix === 'ge') {
            // Greater than or equal to, for numeric filters
            display = `${filterGroupName}: >= ${filterName}`;
          }
          else {
            // TODO: Should somehow notify the user that an applied filter
            // typeSuffix was invalid
            return;
          }
          appliedFilters.pushObject({
            filterGroup: filterInstance.get('filterGroup'),
            display: display});
        });

        return appliedFilters;
      })
    });
  }),
});
