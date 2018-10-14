import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chart: this.get('store').findRecord('chart', params.chart_id),
      record: this.get('store').createRecord('record'),
      users: this.get('store').findAll('user')
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
      newRecord.save().then(() => this.transitionTo('charts.show', chart));
    },

    willTransition() {
      // rollbackAttributes() removes the record from the store
      // if the model 'isNew'
      this.modelFor(this.routeName).record.rollbackAttributes();
    }
  }
});
