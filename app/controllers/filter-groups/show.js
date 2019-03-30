import Controller from '@ember/controller';
import EmberObject from '@ember/object';

export default Controller.extend({
  selectedFilter: null,
  selectedFilterEditableParams: EmberObject.create(),

  actions: {
    selectedFilterChange(filter) {
      this.set('selectedFilter', filter);
      if (filter === null) { return; }

      let params = this.get('selectedFilterEditableParams');
      params.set('name', filter.name);
      params.set('numericValue', filter.numericValue);
    },

    selectedFilterSaveEdits() {
      let params = this.get('selectedFilterEditableParams');
      let filter = this.get('selectedFilter');
      filter.set('name', params.name);
      filter.set('numericValue', params.numericValue);
      filter.save();
    },

    selectedFilterDelete() {
      this.get('selectedFilter').destroyRecord().then(() => {
        this.send('selectedFilterChange', null);
        // Refresh the model (including the group's list of filters)
        this.send('refreshRoute');
      });
    },
  },
});
