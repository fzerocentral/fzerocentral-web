import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | chart-group-contents', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('item', {
      chart_group_id: '1',
      name: 'G1',
    });
    this.set('ladder', { id: '1' });

    await render(hbs`<ChartGroupContents
                       @item={{this.item}}
                       @ladder={{this.ladder}} />`);

    let html = this.element.innerHTML;
    assert.ok(html.length > 0, 'Should render something');
  });
});
