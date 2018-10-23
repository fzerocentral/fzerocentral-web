import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);

    // Set `filtersPerGroup` to have one null object per filter group.
    // TODO: filters -> filtersPerGroup, once we extend this component to
    // editing records as well as creating them
    this.set('filtersPerGroup', {});
    this.get('filterGroups').forEach((filterGroup) => {
      this.get('filtersPerGroup')[filterGroup.id] = null;
    });
  },

  actions: {
    onAnyFilterChange(groupId, filter) {
      // filtersPerGroup -> filters
      // `filtersPerGroup` always has one element per filter group; if no
      // filter was picked for a particular group, it's null.
      // `filters` is what we send to the API and shouldn't include nulls.
      this.get('filtersPerGroup')[groupId] = filter;

      this.get('filters').clear();
      Object.keys(this.get('filtersPerGroup')).forEach((key) => {
        let thisGroupFilter = this.get('filtersPerGroup')[key];
        if (thisGroupFilter) {
          this.get('filters').pushObject(thisGroupFilter);
        }
      });
    }
  }
});
