import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, visit } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | page-navigation-one-page', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // This component requires the router to be set up.
    // eslint-disable-next-line ember/no-private-routing-service
    this.owner.lookup('router:main').setupRouter();
  });

  // Skip: see comments within test.
  test.skip('link', async function (assert) {
    // Need to have a current route.
    // Gets error `"element" is read-only` - what does that mean?
    await visit(`/`);

    await render(hbs`<PageNavigationOnePage @page=5 />`);

    assert.dom(this.element).hasText('5');

    await click('a');

    // Assert that page was updated
  });

  test('button', async function (assert) {
    this.set('updatePage', (value) => {
      this.set('page', value);
    });

    await render(
      hbs`<PageNavigationOnePage @page=5 @updatePage={{updatePage}} />`
    );

    assert.dom(this.element).hasText('5');

    await click('button');

    assert.equal(this.page, 5, 'Page should be updated');
  });
});
