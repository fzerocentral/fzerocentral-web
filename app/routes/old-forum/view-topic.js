import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class OldForumViewTopicRoute extends Route {
  @service router;
  @service store;

  queryParams = {
    topicId: { refreshModel: true },
    postId: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    let topicId = params.topicId;
    let page = params.page;

    if (topicId) {
      return RSVP.hash({
        posts: this.store.query('old-forum-post', {
          topic_id: topicId,
          'page[number]': page,
          include: 'poster',
        }),
        topic: this.store.findRecord('old-forum-topic', topicId, {
          include: 'forum',
        }),
      });
    }

    // No topic ID specified.

    if (!params.postId) {
      // TODO: No topic ID or post ID specified, so we don't know what to
      //  load. This should be handled similarly to a topic ID or post ID
      //  that can't be found.
      return;
    }

    return this.store
      .findRecord('old-forum-post', params.postId)
      .then((mainPost) => {
        topicId = mainPost.topic.get('id');
        return this.store.query('old-forum-post', {
          topic_id: topicId,
          before_post_id: params.postId,
          // We just want the post count here, not the posts themselves,
          // so we only get 1 post.
          'page[size]': 1,
        });
      })
      .then((previousPosts) => {
        let postNumber = previousPosts.meta.pagination.count + 1;
        let POSTS_PER_PAGE = 20;
        page = Math.ceil(postNumber / POSTS_PER_PAGE);

        // Rewrite the query params to use topicId and page instead.
        this.router.transitionTo({
          queryParams: {
            t: topicId,
            page: page,
            p: null,
          },
        });
      });
  }
}
