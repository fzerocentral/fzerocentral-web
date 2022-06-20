import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
  POSTS_PER_PAGE = 20;

  get topicPostNumbers() {
    let offset = (this.page - 1) * this.POSTS_PER_PAGE;
    let postNumbers = [];
    for (let n = 1; n <= this.POSTS_PER_PAGE; n++) {
      postNumbers.push(offset + n);
    }
    return postNumbers;
  }

  @action
  updatePageNumber(pageNumber) {
    this.page = pageNumber;
    // Scroll to top of page, where the first post is
    window.scrollTo(0, 0);
  }
}
