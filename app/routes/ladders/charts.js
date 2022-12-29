import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class LaddersChartsRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      ladder: this.store.findRecord('ladder', params.ladder_id, {
        // This seems like a totally unnecessary include,
        // but it seems to be needed to even get the chart group ID.
        include: 'chart_group',
      }),
    });
  }

  afterModel(resolvedModel /*, transition */) {
    let controller = this.controllerFor(this.routeName);

    controller.chartGroupId = resolvedModel.ladder.chartGroup.get('id');
    controller.updateChartHierarchy();
  }
}
