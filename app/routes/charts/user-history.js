import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chart: this.store.findRecord('chart', params.chart_id),
      user: this.store.findRecord('user', params.user_id),
      records: this.store.query('record', {
        chart_id: params.chart_id, user_id: params.user_id, sort: 'date_achieved',
        improvements: 'flag'
      })
    });
  }
});
