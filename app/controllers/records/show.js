import { action } from '@ember/object';
import ChartsRecordNewController from "../charts/record-new";


export default class RecordsShowController extends ChartsRecordNewController {

  @action
  saveRecordEdits() {
    let record = this.model.record;

    record.filters = [];
    for (let filterGroupId of this.selectedFiltersByGroup) {
      record.filters.pushObject(this.selectedFiltersByGroup[filterGroupId]);
    }

    record.save().then(() => {
      this.target.transitionTo('charts.show', record.chart.get('id'));
    });
  }
}
