import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | find-filter-of-group', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();

    this.groupA = server.create('filterGroup', { name: 'Group A' });
    this.groupB = server.create('filterGroup', { name: 'Group B' });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it renders', async function (assert) {
    this.set('filters', [
      { name: 'Filter A1', filter_group_id: this.groupA.id },
      { name: 'Filter B1', filter_group_id: this.groupB.id },
    ]);
    this.set('filterGroupId', this.groupB.id);
    await render(
      hbs`{{get (find-filter-of-group this.filters this.filterGroupId) "name"}}`
    );

    assert.dom(this.element).hasText('Filter B1');
  });
});
