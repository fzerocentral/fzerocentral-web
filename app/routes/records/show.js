import { action } from '@ember/object';
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

  @action
  saveRecord() {
    let record = this.modelFor(this.routeName).record;

    record.save().then(() => {
      this.transitionTo('charts.show', record.get('chart'));
    });
  },

  @action
  willTransition() {
    this.modelFor(this.routeName).record.rollbackAttributes();
  }
});
