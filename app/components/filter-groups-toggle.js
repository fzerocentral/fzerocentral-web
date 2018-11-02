import Component from '@ember/component';

export default Component.extend({
  filterGroups: null,
  showAllFilterGroups: null,

  init() {
    this._super(...arguments);

    this.send('onCheckboxChange', this.get('showAllFilterGroups'));
  },

  actions: {
    onCheckboxChange(value) {
      let filterGroups = this.get('filterGroups');

      // Pass the filter groups to be shown to onToggleUpdate.
      if (value) {
        this.onToggleUpdate(filterGroups);
      }
      else {
        this.onToggleUpdate(filterGroups.filterBy('showByDefault', true));
      }

      this.set('showAllFilterGroups', value);
    },
  },
  onToggleUpdate() {
    throw new Error('onToggleUpdate must be provided');
  },
});
