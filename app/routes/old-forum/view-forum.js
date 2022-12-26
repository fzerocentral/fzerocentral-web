import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OldForumViewForumRoute extends Route {
  @service store;

  queryParams = {
    forumId: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    return RSVP.hash({
      topics: this.store.query('old-forum-topic', {
        forum_id: params.forumId,
        'page[number]': params.page,
        include: 'first_post.poster,last_post,last_post.poster',
      }),
      forum: this.store.findRecord('old-forum-forum', params.forumId),
    });
  }
}
