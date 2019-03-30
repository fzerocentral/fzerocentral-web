import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chartTypes: this.get('store').query(
        'chart-type', {filter_group_id: params.filter_group_id}),
      filterGroup: this.get('store').findRecord(
        'filter-group', params.filter_group_id),
      filters: this.get('store').query(
        'filter', {filter_group_id: params.filter_group_id}),
      filterImplicationLinks: this.get('store').query(
        'filter-implication-link', {filter_group_id: params.filter_group_id}),
      newFilter: this.get('store').createRecord('filter'),
      newFilterImplicationLink: this.get('store').createRecord(
        'filter-implication-link'),
    });
  },

  actions: {
    createFilter() {
      let newFilter = this.modelFor(this.routeName).newFilter;
      newFilter.set('filterGroup', this.modelFor(this.routeName).filterGroup);

      // Save the filter
      newFilter.save().then(() => {
        // Refresh the model (including the group's list of filters + the
        // new filter tied to the UI fields)
        this.refresh();
      });
    },

    createFilterImplicationLink() {
      let newFilterImplicationLink = this.modelFor(this.routeName).newFilterImplicationLink;

      // Save the FI link
      newFilterImplicationLink.save().then(() => {
        // Refresh the model (including current FI links + the
        // new filter group tied to the UI fields)
        this.refresh();
      });
    },

    deleteFilterImplicationLink(link) {
      link.destroyRecord().then(() => {
        // Refresh the model (including current FI links)
        this.refresh();
      });
    },

    refreshRoute() {
      this.refresh();
    },

    willTransition() {
      // rollbackAttributes() removes the record from the store
      // if the model 'isNew'
      this.modelFor(this.routeName).newFilter.rollbackAttributes();
      this.modelFor(this.routeName).newFilterImplicationLink.rollbackAttributes();
      // Reset selectedFilter, else it will persist until the next time we go
      // to this route
      this.controllerFor(this.routeName).send('selectedFilterChange', null);
    },
  },
});
