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
    });
  },

  actions: {
    saveRecord() {
      let chart = this.modelFor(this.routeName).chart;
      let newRecord = this.modelFor(this.routeName).record;

      newRecord.set('chart', chart);

      if (!newRecord.get('achievedAt')) {
        // If no date entered, use the current date.
        newRecord.set('achievedAt', new Date());
      }

      newRecord.save().then(() => this.transitionTo('charts.show', chart.id));
    },

    willTransition() {
      // rollbackAttributes() removes the record from the store
      // if the model 'isNew'
      this.modelFor(this.routeName).record.rollbackAttributes();
    }
  }
});
