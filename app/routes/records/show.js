import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class RecordsShowRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      record: this.store.findRecord(
        'record', params.record_id, {include: 'filters'}),
      filterGroups: this.store.query(
        'filterGroup', {record_id: params.record_id}),
    });
  }

  @action
  saveRecord() {
    let record = this.modelFor(this.routeName).record;

    record.save().then(() => {
      this.transitionTo('charts.show', record.get('chart').id);
    });
  }

  @action
  willTransition() {
    this.modelFor(this.routeName).record.rollbackAttributes();
  }
}
