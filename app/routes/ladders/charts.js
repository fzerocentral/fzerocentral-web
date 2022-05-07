import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class LaddersChartsRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      ladder: this.store.findRecord('ladder', params.ladder_id),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    controller.chartGroupId = resolvedModel.ladder.chartGroup.get('id');
    controller.updateChartHierarchy();
  }
}
