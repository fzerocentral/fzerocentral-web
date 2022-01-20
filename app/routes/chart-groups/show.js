import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChartGroupsShowRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('chart-group', params.chart_group_id);
  }
}
