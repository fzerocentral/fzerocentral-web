import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  queryParams: {
    // TODO: Is this right, or should it be filters? (We can test this once we
    // implement an add-filter button.)
    appliedFiltersString: {
      // Re-run the model hook if this query param changes.
      refreshModel: true
    }
  },

  model(params) {
    return RSVP.hash({
      chart: this.get('store').findRecord('chart', params.chart_id),
      records: this.get('store').query('record', {
        chart_id: params.chart_id, sort: 'value', ranked_entity: 'user',
        filters: params.appliedFiltersString}),
      filterGroups: this.get('store').query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
});
