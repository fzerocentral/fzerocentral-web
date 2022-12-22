import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import OldForumTopicModel from '../../models/old-forum-topic';

export default class OldForumViewTopicController extends Controller {
  queryParams = [
    // On the Ember side this is `topicId`; for the URL it'll be `t`.
    { topicId: 't' },
    { postId: 'p' },
    'page',
  ];
  @tracked topicId = null;
  @tracked postId = null;
  @tracked page = 1;

  get topicPostNumbers() {
    let offset = (this.page - 1) * OldForumTopicModel.POSTS_PER_PAGE;
    let postNumbers = [];
    for (let n = 1; n <= OldForumTopicModel.POSTS_PER_PAGE; n++) {
      postNumbers.push(offset + n);
    }
    return postNumbers;
  }
}
