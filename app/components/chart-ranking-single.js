import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service('store'),

  init() {
    this._super(...arguments);

    this.records = this.get('store').query('record', {chart_id: this.chart.id});
  },
});
