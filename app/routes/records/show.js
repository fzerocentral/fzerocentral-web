import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import ChartsRecordNewRoute from "../charts/record-new";


// Extends record-new.
export default class RecordsShowRoute extends ChartsRecordNewRoute {
  @service store;

  model(params) {
    return RSVP.hash({
      record: this.store.findRecord(
        'record', params.record_id, {include: 'filters'}),
      filterGroups: this.store.query(
        'filterGroup', {record_id: params.record_id}),
    });
  }
}
