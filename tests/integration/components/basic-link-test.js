import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | basic-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<BasicLink
                       @route='charts.show'
                       @model='1' />`);

    let html = this.element.innerHTML;
    assert.ok(html.length > 0, 'Should render something');
  });
});
