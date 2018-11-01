import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chart: this.get('store').findRecord('chart', params.chart_id),
      records: this.get('store').query('record', {
        chart_id: params.chart_id, sort: 'value', ranked_entity: 'user'}),
      filterGroups: this.get('store').query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
});
