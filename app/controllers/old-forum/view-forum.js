import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OldForumViewForumController extends Controller {
  queryParams = [
    // On the Ember side this is `forumId`; for the URL it'll be `f`.
    { forumId: 'f' },
    'page',
  ];
  @tracked forumId = null;
  @tracked page = 1;

  @action
  updatePageNumber(pageNumber) {
    this.page = pageNumber;
    // Scroll to top of page, where the first topic is
    window.scrollTo(0, 0);
  }
}
