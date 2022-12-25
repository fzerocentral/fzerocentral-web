import { A } from '@ember/array';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import OldForumTopicModel from '../../models/old-forum-topic';

export default class OldForumViewTopicRoute extends Route {
  @service router;
  @service store;

  queryParams = {
    topicId: { refreshModel: true },
    postId: { refreshModel: true },
    page: { refreshModel: true },
    start: { refreshModel: true },
  };

  model(params) {
    if (params.start) {
      // `start` starts at 0 for the first post.
      // In theory, start can make us retrieve something like posts 7-26,
      // assuming page size 20. However, we'll just retrieve the page that
      // the start post is on, for simplicity; so start=6 will still get
      // posts 1-20.
      let postNumber = Number(params.start) + 1;
      let page = Math.ceil(postNumber / OldForumTopicModel.POSTS_PER_PAGE);

      // Then use page instead of start.
      this.router.transitionTo({
        queryParams: {
          t: params.topicId,
          page: page,
          start: null,
        },
      });
    }

    let topicId = params.topicId;
    let page = params.page;

    let topicPromise = this.store.findRecord('old-forum-topic', topicId, {
      include: 'forum,poll',
    });

    if (topicId) {
      return RSVP.hash({
        posts: this.store.query('old-forum-post', {
          topic_id: topicId,
          'page[number]': page,
          'page[size]': OldForumTopicModel.POSTS_PER_PAGE,
          include: 'poster',
        }),
        topic: topicPromise,

        pollOptions: this.getPollOptions(topicPromise),
      });
    }

    // No topic ID specified.

    if (!params.postId) {
      // TODO: No topic ID or post ID specified, so we don't know what to
      //  load. This should be handled similarly to a topic ID or post ID
      //  that can't be found. (And we need to handle that reasonably, too)
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
        page = Math.ceil(postNumber / OldForumTopicModel.POSTS_PER_PAGE);

        // Rewrite the URL to use topicId and page as query params, and
        // a fragment to jump to the specific post.
        // transitionTo() doesn't seem to respect the URL fragment, so we
        // set window.location directly.
        let searchParams = new URLSearchParams();
        searchParams.append('t', topicId);
        searchParams.append('page', page);
        let baseUrl = window.location.pathname;
        window.location = `${baseUrl}?${searchParams}#${params.postId}`;
      });
  }

  getPollOptions(topicPromise) {
    return topicPromise.then((topic) => {
      if (!topic.hasPoll) {
        // Promise that resolves to empty array
        return new Promise((resolve) => {
          resolve(A([]));
        });
      }
      return this.store.query('old-forum-poll-option', {
        poll_id: topic.poll.get('id'),
      });
    });
  }
}
