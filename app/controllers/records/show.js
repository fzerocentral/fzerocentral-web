import { action } from '@ember/object';
import ChartsRecordNewController from "../charts/record-new";
import { setFormError } from "../../utils/forms";


// Extends record-new.
export default class RecordsShowController extends ChartsRecordNewController {

  @action
  saveRecordEdits() {
    let record = this.model.record;

    let attributes = {
      'date-achieved': this.dateAchieved,
    }

    let filterIds = [];
    for (let filterSelect of Object.values(this.filterSelects)) {
      if (filterSelect.selectedFilterId) {
        filterIds.push(filterSelect.selectedFilterId);
      }
    }

    this.nonEmberDataApi.editRecord(
      record.id, attributes, filterIds)
    .then(data => {
      if ('errors' in data) {
        let error = data.errors[0];
        // Take the string after the last / to be the field name.
        let fieldName = error.source.pointer.split('/').slice(-1)[0];
        throw new Error(`${fieldName}: ${error.detail}`);
      }

      // Success.
      this.target.transitionTo('charts.show', record.chart.get('id'));
    })
    .catch(error => {
      setFormError(this.form, error.message);
    });
  }
}
