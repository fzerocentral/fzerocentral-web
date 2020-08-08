import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  chart: null,
  filterGroups: null,
  records: null,
  showAllFilterGroups: null,

  @computed('filterGroups.[]', 'showAllFilterGroups')
  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.filterGroups;
    }
    else {
      return this.filterGroups.filterBy('showByDefault', true);
    }
  },
});
