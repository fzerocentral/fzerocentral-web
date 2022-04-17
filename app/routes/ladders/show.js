import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';


export default class LaddersShowRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      ladder: this.store.findRecord('ladder', params.ladder_id),
    });
  }
}
