import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartsUserHistoryRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      user: this.store.findRecord('user', params.user_id),
      records: this.store.query('record', {
        chart_id: params.chart_id, user_id: params.user_id,
        sort: 'date_achieved', improvements: 'flag', per_page: 1000}),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
}
