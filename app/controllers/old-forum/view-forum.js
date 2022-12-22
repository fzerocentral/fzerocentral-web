import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OldForumViewForumController extends Controller {
  queryParams = [
    // On the Ember side this is `forumId`; for the URL it'll be `f`.
    { forumId: 'f' },
    'page',
  ];
  @tracked forumId = null;
  @tracked page = 1;
}
