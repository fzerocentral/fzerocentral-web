import Component from '@ember/component';

export default Component.extend({
  filterGroup: null,
  filterUsageType: null,

  actions: {
    onFilterChange() {
      this.onFilterChange(...arguments);
    },
  },
  onFilterChange() {
    throw new Error('onFilterChange must be provided');
  },
});
