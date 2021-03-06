import { action } from '@ember/object';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chartTypes: this.get('store').query(
        'chart-type', {filter_group_id: params.filter_group_id}),
      filterGroup: this.get('store').findRecord(
        'filter-group', params.filter_group_id),
      newFilter: this.get('store').createRecord('filter'),
    });
  },

  @action
  createFilter() {
    let newFilter = this.modelFor(this.routeName).newFilter;
    newFilter.set('filterGroup', this.modelFor(this.routeName).filterGroup);

    // Save the filter
    newFilter.save().then(() => {
      // Success callback
      this.controllerFor(this.routeName).set('filterCreateError', null);

      // Refresh filter-list computed properties by changing this property.
      this.controllerFor(this.routeName).set(
        'filtersLastUpdated', new Date());

      // Refresh the model to reset newFilter.
      this.refresh();
    }, (response) => {
      // Error callback
      this.controllerFor(this.routeName).set(
        'filterCreateError', response.errors[0]);
    });
  },

  @action
  willTransition() {
    // rollbackAttributes() removes the record from the store
    // if the model 'isNew'
    this.modelFor(this.routeName).newFilter.rollbackAttributes();
    // Reset state, else it will persist until the next time we go
    // to this route
    this.controllerFor(this.routeName).set('filterCreateError', null);
    this.controllerFor(this.routeName).set('selectedFilterId', null);
  },
});
