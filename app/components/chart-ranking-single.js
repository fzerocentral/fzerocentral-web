import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    let args = {chart_id: this.chart.id, sort: 'value', ranked_entity: 'user'};
    this.set('records', this.get('store').query('record', args));
  },
});
