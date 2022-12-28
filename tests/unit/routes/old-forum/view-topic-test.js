import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | old-forum/view-topic', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:old-forum/view-topic');
    assert.ok(route);
  });

  // Skip: see comments within test.
  test.skip('p query arg', async function (assert) {
    let topic = createModelInstance(this.server, 'old-forum-topic', {
      id: '2',
    });

    let post = createModelInstance(this.server, 'old-forum-post', {
      id: '4',
      topic: topic,
      text: 'Post number 4',
    });

    // This should get called to retrieve the specific post
    this.server.pretender.get('/old_forum_posts/4/', (/* request */) => {
      let body = {
        data: {
          type: 'old-forum-posts',
          id: '4',
          attributes: {
            text: 'Post number 4',
          },
          relationships: {
            topic: {
              data: {
                type: 'old-forum-topics',
                id: '2',
              },
            },
          },
        },
      };
      return [200, {}, JSON.stringify(body)];
    });

    // This should get called to get:
    // 1) the number of posts before the requested post in the topic
    // 2) the posts on the same page as the requested post in the topic
    this.server.pretender.get('/old_forum_posts/', (/* request */) => {
      let body = {
        data: [],
        meta: { pagination: { count: 0 } },
      };
      return [200, {}, JSON.stringify(body)];
    });

    // TODO: there's a set of window.location that happens here which
    //  kicks us out of the test. One of a few things needs to be done:
    //  A) window.location needs to be mocked for tests somehow
    //  B) the set of window.location needs to be put into a utility
    //     function which can be mocked
    //  C) the redirect needs to be reworked to not involve setting
    //     window.location directly
    await visit(`/old-forum/view-topic?p=${post.id}`);

    assert.dom(this.element).includesText('Post number 4');
  });
});
