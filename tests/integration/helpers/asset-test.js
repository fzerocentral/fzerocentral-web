import { module, test } from 'qunit';
import { setupRenderingTest } from 'fzerocentral-web/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | asset', function (hooks) {
  setupRenderingTest(hooks);

  test('no fingerprinting', async function (assert) {
    this.set('relativePath', 'dir1/dir2/image1.jpg');

    await render(hbs`{{asset this.relativePath}}`);

    assert.dom(this.element).hasText('/assets/dir1/dir2/image1.jpg');
  });
});
