import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | image-asset', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('relativePath', 'dir1/dir2/image1.jpg');

    await render(hbs`{{image-asset this.relativePath}}`);

    assert.dom(this.element).hasText('/assets/images/dir1/dir2/image1.jpg');
  });
});
