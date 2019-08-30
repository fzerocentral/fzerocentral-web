import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  appliedFiltersString: null,
  filterGroups: A([]),
  selectedCompareOption: null,
  selectedFilter: null,
  selectedFilterGroup: null,
  store: service('store'),

  appliedFilterSpecs: computed('appliedFiltersString', function() {
    let appliedFiltersString = this.get('appliedFiltersString');
    if (appliedFiltersString === null) {
      return A([]);
    }

    let appliedFilterStrings = appliedFiltersString.split('-');
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

  appliedFilters: computed('appliedFilterSpecs', function() {
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

  compareOptions: computed('selectedFilterGroup', function() {
    let group = this.get('selectedFilterGroup');
    if (!group) {
      return A([]);
    }

    let compareOptions = A([]);
    compareOptions.pushObject({text: "-", typeSuffix: ''});
    compareOptions.pushObject({text: "NOT", typeSuffix: 'n'});
    if (group.get('kind') === 'numeric') {
      compareOptions.pushObject({text: ">=", typeSuffix: 'ge'});
      compareOptions.pushObject({text: "<=", typeSuffix: 'le'});
    }

    return compareOptions;
  }),

  filterOptions: computed('selectedFilterGroup', function() {
    let group = this.get('selectedFilterGroup');
    if (!group) {
      // Return an empty array wrapped in an already-resolved Promise
      return DS.PromiseArray.create({
        promise: Promise.resolve().then(() => {
          return A([]);
        })
      });
    }

    return this.get('store').query(
      'filter', {filter_group_id: group.get('id')});
  }),


  didUpdate() {
    // Things to re-check when any attributes update. Only put things here
    // which can't be done using computed properties (e.g. because we're
    // dealing an attribute which can also be interactively changed, and
    // thus can't be a computed property).

    let selectedFilter = this.get('selectedFilter');
    if (selectedFilter) {
      let selectedFilterGroup = this.get('selectedFilterGroup');
      if (selectedFilter.get('filterGroup').get('id')
          !== selectedFilterGroup.get('id')) {
        // selectedFilter is not in the current filter group, so reset it.
        this.set('selectedFilter', null);
      }
    }

    let selectedCompareOption = this.get('selectedCompareOption');
    let compareOptions = this.get('compareOptions');
    let defaultCompareOption = compareOptions.find((option) => {
      return option.text === '-';
    });
    if (selectedCompareOption) {
      let matchingOption = compareOptions.find((option) => {
        return option.text === selectedCompareOption.text;
      });
      if (!matchingOption) {
        // selectedCompareOption is not in the current options, so reset it
        // to the default option, which should be available for any
        // filter group.
        this.set('selectedCompareOption', defaultCompareOption);
      }
    }
    else {
      // Set this compare option by default, as opposed to 'Not selected'.
      // The default is the common case, so this should generally save the
      // user a bit of time.
      this.set('selectedCompareOption', defaultCompareOption);
    }
  },


  actions: {
    addFilter() {
      // Get the existing applied-filter strings
      let filtersString = this.get('appliedFiltersString');
      let filterStrings = [];
      if (filtersString !== null) {
        filterStrings = filtersString.split('-');
      }

      // Make a string for the newly added filter
      let newFilterId = this.get('selectedFilter').get('id');
      let compareOptionTypeSuffix =
        this.get('selectedCompareOption').typeSuffix;
      let newFilterString = `${newFilterId}${compareOptionTypeSuffix}`;

      // Add the new string
      filterStrings.push(newFilterString);
      let newAppliedFiltersString = filterStrings.join('-');
      this.send('updateAppliedFiltersString', newAppliedFiltersString);
    },

    removeFilter(index) {
      // We're assuming this'll only ever be called with a valid index.
      let filtersString = this.get('appliedFiltersString');
      let filterStrings = filtersString.split('-');
      // Remove 1 element at the specified index.
      filterStrings.splice(index, 1);

      if (filterStrings.length === 0) {
        // We expect null, not '', if there's 0 filters applied.
        this.set('appliedFiltersString', null);
      }
      else {
        this.set('appliedFiltersString', filterStrings.join('-'));
      }
    },

    updateAppliedFiltersString() {
      this.updateAppliedFiltersString(...arguments);
    },
  },

  updateAppliedFiltersString() {
    throw new Error('updateAppliedFiltersString must be provided');
  },
});
