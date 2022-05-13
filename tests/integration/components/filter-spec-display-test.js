import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | filter-spec-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('filterObjs', []);

    await render(hbs`<FilterSpecDisplay
                       @filterSpec=''
                       @filterObjs={{this.filterObjs}} />`);

    let html = this.element.innerHTML;
    assert.ok(html.length > 0, 'Should render something');
  });
});
