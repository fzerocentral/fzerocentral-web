import Controller from '@ember/controller';
import { action } from '@ember/object';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class ChartsRecordNewController extends Controller {

  @tracked model;

  @tracked filterOptionsByGroup = EmberObject.create();
  @tracked selectedFiltersByGroup = EmberObject.create();

  @service store;

  @action
  selectFilter(filterGroupId, filter) {
    this.selectedFiltersByGroup.set(filterGroupId, filter);
  }

  @action
  onSearchTextChange(filterGroupId, searchText) {
    this.filterOptionsByGroup.set(
      filterGroupId, this.store.query('filter', {
        filter_group_id: filterGroupId,
        name_search: searchText,
        usage_type: 'choosable',
      }));
  }

  @action
  saveRecord() {
    let chart = this.model.chart;
    let newRecord = this.model.record;

    newRecord.chart = chart;
    newRecord.filters = [];
    for (let filterGroupId of Object.keys(this.selectedFiltersByGroup)) {
      newRecord.filters.pushObject(this.selectedFiltersByGroup[filterGroupId]);
    }

    if (!newRecord.dateAchieved) {
      // If no date entered, use the current date.
      newRecord.dateAchieved = new Date();
    }

    newRecord.save().then(
      () => this.target.transitionTo('charts.show', chart.id));
  }
}
