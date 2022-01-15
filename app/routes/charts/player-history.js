import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartsPlayerHistoryRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      player: this.store.findRecord('player', params.player_id),
      records: this.store.query('record', {
        chart_id: params.chart_id, player_id: params.player_id,
        sort: 'date_achieved', improvements: 'flag', 'page[size]': 1000}),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
}
