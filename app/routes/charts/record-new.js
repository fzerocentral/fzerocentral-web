import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';


export default class ChartsRecordNewRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      record: this.store.createRecord('record'),
      players: this.store.query('player', {'page[size]': 1000}),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    resolvedModel.filterGroups.forEach((filterGroup) => {
      controller.filterOptionsByGroup.set(
        filterGroup.id, this.store.query('filter', {
          filter_group_id: filterGroup.id,
          usage_type: 'choosable',
        }));

      controller.selectedFiltersByGroup.set(
        filterGroup.id,
        resolvedModel.record.filters.find(
          (filter) => filter.filterGroup.get('id') === filterGroup.id));
    });
  }

  @action
  willTransition() {
    // rollbackAttributes() removes the record from the store
    // if the model 'isNew'
    this.modelFor(this.routeName).record.rollbackAttributes();
  }
}
