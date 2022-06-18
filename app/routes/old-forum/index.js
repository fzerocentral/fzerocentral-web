import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OldForumIndexRoute extends Route {
  @service store;

  model() {
    return RSVP.hash({
      categories: this.store.query('old-forum-category', {
        include: 'forums',
      }),
    });
  }
}
