import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartsShowRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  queryParams = {
    appliedFiltersString: {
      // Re-run the model hook if this query param changes.
      // In particular, we need the records to refresh when the filters change.
      refreshModel: true
    }
  };

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      records: this.nonEmberDataApi.getChartRanking(
        params.chart_id, params.appliedFiltersString),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
}
