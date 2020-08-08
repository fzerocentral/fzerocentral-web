import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { clearSelected, selectChoose } from 'ember-power-select/test-support';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { assertPowerSelectCurrentTextEqual, assertPowerSelectOptionsEqual }
  from 'fzerocentral-web/tests/helpers/power-select-helpers';

module('Integration | Component | filter-select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();

    let store = this.owner.lookup('service:store');

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.filterA1 = server.create('filter', {name: 'Filter A1', filterGroup: this.groupA});
    server.create('filter', {name: 'Filter A2', filterGroup: this.groupA});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('filterGroup', run(
      () => store.findRecord('filterGroup', this.groupA.id)));
    this.set('filter', null);
    this.set('onAnyFilterChange', (filter) => {
      this.set('filter', filter);
    });
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('should tolerate null filterGroup', async function(assert) {
    this.set('filterGroup', null);

    // Use `onAnyFilterChange` when onAnyFilterChange is a property.
    // Use `'onAnyFilterChange'` when onAnyFilterChange is defined in
    // a component's `actions`.
    await render(hbs`
      <FilterSelect
        @filterGroup={{filterGroup}}
        @selected={{filter}}
        @onFilterChange={{action onAnyFilterChange}} />
    `);

    let select = this.element.querySelector('.ember-power-select-trigger');
    await assertPowerSelectOptionsEqual(
      assert, select, ["Type to search"],
      "Choices should be empty");

    assert.equal(this.params, null, "params should be null");
  });

  test('initializes selection to placeholder text', async function(assert) {

    await render(hbs`
      <FilterSelect
        @filterGroup={{filterGroup}}
        @selected={{filter}}
        @onFilterChange={{action onAnyFilterChange}} />
    `);

    let select = this.element.querySelector('.ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, select, "Not selected",
      "Should be initialized to placeholder text");
  });

  test('can change filter', async function(assert) {

    await render(hbs`
      <FilterSelect
        @filterGroup={{filterGroup}}
        @selected={{filter}}
        @onFilterChange={{action onAnyFilterChange}} />
    `);

    await selectChoose(`.ember-power-select-trigger`, "Filter A1");

    // Test parent callback's result.
    assert.equal(this.filter.get('name'), "Filter A1");
    assert.equal(this.filter.get('id'), this.filterA1.id);

    // Test text.
    let select = this.element.querySelector('.ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, select, "Filter A1",
      "Should have selected Filter A1");
  });

  test('can clear selection', async function(assert) {

    await render(hbs`
      <FilterSelect
        @filterGroup={{filterGroup}}
        @selected={{filter}}
        @onFilterChange={{action onAnyFilterChange}} />
    `);

    await selectChoose(`.ember-power-select-trigger`, "Filter A1");
    await clearSelected(`.ember-power-select-trigger`);

    // Test parent callback's result.
    assert.equal(this.filter, null);

    // Test text.
    let select = this.element.querySelector('.ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, select, "Not selected",
      "Selection should be cleared");
  });
});
