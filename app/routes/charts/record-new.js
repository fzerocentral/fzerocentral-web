import { A } from '@ember/array'
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chart: this.get('store').findRecord('chart', params.chart_id),
      record: this.get('store').createRecord('record'),
      users: this.get('store').findAll('user'),
      filterGroups: this.get('store').query(
        'filterGroup', {chart_id: params.chart_id}),
      // Mutable array which works with Ember bindings, as long as we use
      // certain functions like pushObject() and replace().
      // This isn't exactly a model; it's just to give the route more state to
      // work with.
      filterGroupHashes: A([]),
    });
  },

  actions: {
    saveRecord() {
      let chart = this.modelFor(this.routeName).chart;
      let newRecord = this.modelFor(this.routeName).record;

      newRecord.set('chart', chart);
      // Current date. Later we'd probably add a date field and make this the
      // default.
      newRecord.set('achievedAt', new Date());

      let filters = [];
      let filterGroupHashes = this.modelFor(this.routeName).filterGroupHashes;
      filterGroupHashes.forEach((filterGroupHash) => {
        // If the filter is not 'unspecified', then add it
        if (filterGroupHash.currentFilter.model !== null) {
          filters.push(filterGroupHash.currentFilter.model);
        }
      });
      newRecord.set('filters', filters);

      newRecord.save().then(() => this.transitionTo('charts.show', chart));
    },

    willTransition() {
      // rollbackAttributes() removes the record from the store
      // if the model 'isNew'
      this.modelFor(this.routeName).record.rollbackAttributes();
    }
  }
});
