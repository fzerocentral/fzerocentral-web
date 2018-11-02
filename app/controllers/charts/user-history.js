import { A } from '@ember/array';
import Controller from '@ember/controller';

export default Controller.extend({
  shownFilterGroups: A([]),

  actions: {
    // If we could set array properties directly, we'd use `action (mut
    // shownFilterGroups)` instead of this defined action. But we can't set
    // array properties directly in Ember.
    onToggleUpdate(newShownFilterGroups) {
      // Clear old filter groups
      this.get('shownFilterGroups').clear();
      // Add new set of filter groups
      newShownFilterGroups.forEach((filterGroup) => {
        this.get('shownFilterGroups').pushObject(filterGroup);
      });
    },
  },
});
