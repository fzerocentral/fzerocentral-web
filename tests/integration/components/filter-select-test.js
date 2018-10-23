import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { clearSelected, selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter-select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();

    let store = this.owner.lookup('service:store');

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.filterA1 = server.create('filter', {name: 'Filter A1', filterGroups: [this.groupA]});
    server.create('filter', {name: 'Filter A2', filterGroups: [this.groupA]});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('filterGroup', run(() => store.findRecord('filterGroup', this.groupA.id)));
    this.set('onAnyFilterChange', (filter) => {
      this.set('filter', filter);
    });
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('initializes filter to not-selected', async function(assert) {

    // Use `onAnyFilterChange` when onAnyFilterChange is a property.
    // Use `'onAnyFilterChange'` when onAnyFilterChange is defined in
    // a component's `actions`.
    await render(hbs`
      {{filter-select
        filterGroup=filterGroup
        parentOnFilterChange=(action onAnyFilterChange)}}
    `);

    // The first span within `.ember-power-select-trigger` should contain
    // either the placeholder text or the selection text, while not containing
    // the little x which lets you clear the selection.
    assert.equal(this.element.querySelector(`.ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
  });

  test('can change filter', async function(assert) {

    await render(hbs`
      {{filter-select
        filterGroup=filterGroup
        parentOnFilterChange=(action onAnyFilterChange)}}
    `);

    await selectChoose(`.ember-power-select-trigger`, "Filter A1");

    // Test parent callback's result.
    assert.equal(this.get('filter').get('name'), "Filter A1");
    assert.equal(this.get('filter').get('id'), this.filterA1.id);
    // Test text.
    assert.equal(this.element.querySelector(`.ember-power-select-trigger > span:first-child`).textContent.trim(), "Filter A1");
  });

  test('can clear selection', async function(assert) {

    await render(hbs`
      {{filter-select
        filterGroup=filterGroup
        parentOnFilterChange=(action onAnyFilterChange)}}
    `);

    await selectChoose(`.ember-power-select-trigger`, "Filter A1");
    await clearSelected(`.ember-power-select-trigger`);

    // Test parent callback's result.
    assert.equal(this.get('filter'), null);
    // Test text.
    assert.equal(this.element.querySelector(`.ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
  });
});
