import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | chart-group-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('item', {
      chart: { id: '1' },
      name: 'C1',
    });

    await render(hbs`<ChartGroupContents
                       @item={{this.item}}
                       @prefix='' />`);

    let html = this.element.innerHTML;
    assert.ok(html.length > 0, 'Should render something');
  });
});
