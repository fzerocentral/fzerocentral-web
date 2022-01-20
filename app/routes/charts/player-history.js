import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ChartsPlayerHistoryRoute extends Route {
  @service nonEmberDataApi;
  @service store;

  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      player: this.store.findRecord('player', params.player_id),
      records: this.nonEmberDataApi.getChartPlayerHistory(
        params.chart_id, params.player_id, null),
      filterGroups: this.store.query(
        'filterGroup', {chart_id: params.chart_id}),
    });
  }
}
