import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { LadderAndFilterControlsManager } from '../../../components/ladder-and-filter-controls';

let moduleName = 'Integration | Component | ladder-and-filter-controls';
module(moduleName, function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('appliedFiltersString', null);
    this.set(
      'manager',
      new LadderAndFilterControlsManager(
        null,
        [],
        [],
        () => {},
        [],
        [],
        () => {},
        () => {}
      )
    );
  });

  test('should render', async function (assert) {
    await render(hbs`
      <LadderAndFilterControls
        @extraFiltersString={{this.appliedFiltersString}}
        @manager={{this.manager}} />`);

    let html = this.element.innerHTML;
    assert.ok(html.length > 0, 'Should render something');
  });
});
