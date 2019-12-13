import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  chart: null,
  filterGroups: null,
  records: null,
  showAllFilterGroups: null,

  @computed('filterGroups.[]', 'showAllFilterGroups')
  get shownFilterGroups() {
    if (this.get('showAllFilterGroups')) {
      return this.get('filterGroups');
    }
    else {
      return this.get('filterGroups').filterBy('showByDefault', true);
    }
  },
});
