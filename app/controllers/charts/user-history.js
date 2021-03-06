import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  showAllFilterGroups: null,

  @computed('model.filterGroups.[]', 'showAllFilterGroups')
  get shownFilterGroups() {
    if (this.get('showAllFilterGroups')) {
      return this.model.filterGroups;
    }
    else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  },
});
