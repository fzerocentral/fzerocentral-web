import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DummyModel } from '../../../../utils/models';

let moduleName =
  'Integration | Component | old-forum/view-forum/topic-page-links';
module(moduleName, function (hooks) {
  setupRenderingTest(hooks);

  test('two pages', async function (assert) {
    // pageCount is a getter function of the topic model, but we'll just
    // fake it here.
    this.set('topic', new DummyModel({ id: '1', pageCount: 2 }));

    await render(hbs`<OldForum::ViewForum::TopicPageLinks
                       @topic={{this.topic}} />`);
    assert.dom(this.element).hasText('1 2');
  });

  test('four pages', async function (assert) {
    this.set('topic', new DummyModel({ id: '1', pageCount: 4 }));

    await render(hbs`<OldForum::ViewForum::TopicPageLinks
                       @topic={{this.topic}} />`);
    assert.dom(this.element).hasText('1 2 3 4');
  });

  test('five pages', async function (assert) {
    this.set('topic', new DummyModel({ id: '1', pageCount: 5 }));

    await render(hbs`<OldForum::ViewForum::TopicPageLinks
                       @topic={{this.topic}} />`);
    assert.dom(this.element).hasText('1 ... 3 4 5');
  });
});
