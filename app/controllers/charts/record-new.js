import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getFormField, setFormError } from '../../utils/forms';

export default class ChartsRecordNewController extends Controller {
  @service nonEmberDataApi;
  @service store;

  @tracked model;

  @tracked dateAchieved;
  @tracked filterSelects = {};
  @tracked selectedFiltersByGroup = {};
  formId = 'record-form';

  get form() {
    return document.getElementById(this.formId);
  }

  @action
  getFilterOptionsForGroup(filterGroupId, searchText) {
    return this.store.query('filter', {
      filter_group_id: filterGroupId,
      name_search: searchText,
      usage_type: 'choosable',
    });
  }

  @action
  submitRecord() {
    let chart = this.model.chart;

    let attributes = {
      // Default to current date.
      'date-achieved': this.dateAchieved ?? new Date(),
      value: getFormField(this.form, 'value').value,
    };

    let playerId = getFormField(this.form, 'player').value;

    let filterIds = [];
    for (let filterSelect of Object.values(this.filterSelects)) {
      if (filterSelect.selectedFilterId) {
        filterIds.push(filterSelect.selectedFilterId);
      }
    }

    this.nonEmberDataApi
      .createRecord(chart.id, attributes, playerId, filterIds)
      .then((data) => {
        if ('errors' in data) {
          let error = data.errors[0];
          // Take the string after the last / to be the field name.
          let fieldName = error.source.pointer.split('/').slice(-1)[0];
          throw new Error(`${fieldName}: ${error.detail}`);
        }

        // Success.
        this.target.transitionTo('charts.show', chart.id);
      })
      .catch((error) => {
        setFormError(this.form, error.message);
      });
  }
}
