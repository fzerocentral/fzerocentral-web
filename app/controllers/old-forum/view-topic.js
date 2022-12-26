import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import OldForumTopicModel from '../../models/old-forum-topic';

export default class OldForumViewTopicController extends Controller {
  queryParams = [
    // Topic ID for both old and new sites.
    // On the Ember side this is `topicId`; for the URL it'll be `t`.
    { topicId: 't' },
    // Post ID for old site. We care about this because we'll redirect
    // old-site URLs to new-site URLs.
    { postId: 'p' },
    // Page / start post for new site.
    'page',
    // Page / start post for old site.
    { start: 'start' },
  ];
  @tracked topicId = null;
  @tracked postId = null;
  @tracked page = 1;
  @tracked start = null;

  get topicPostNumbers() {
    let offset = (this.page - 1) * OldForumTopicModel.POSTS_PER_PAGE;
    let postNumbers = [];
    for (let n = 1; n <= OldForumTopicModel.POSTS_PER_PAGE; n++) {
      postNumbers.push(offset + n);
    }
    return postNumbers;
  }
}
