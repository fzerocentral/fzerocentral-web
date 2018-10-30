import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      record: this.get('store').findRecord('record', params.record_id),
      filterGroups: this.get('store').query(
        'filterGroup', {record_id: params.record_id}),
    });
  },

  actions: {
    saveRecord() {
      let record = this.modelFor(this.routeName).record;

      record.save().then(() => {
        this.transitionTo('charts.show', record.get('chart'));
      });
    },

    willTransition() {
      this.modelFor(this.routeName).record.rollbackAttributes();
    }
  }
});
