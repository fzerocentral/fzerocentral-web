import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { clearSelected, selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | record-filters-edit', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();

    let store = this.owner.lookup('service:store');

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.filterA1 = server.create('filter', {name: 'Filter A1', filterGroups: [this.groupA]});
    server.create('filter', {name: 'Filter A2', filterGroups: [this.groupA]});
    this.groupB = server.create('filterGroup', {name: 'Group B'});
    server.create('filter', {name: 'Filter B1', filterGroups: [this.groupB]});
    this.filterB2 = server.create('filter', {name: 'Filter B2', filterGroups: [this.groupB]});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('filterGroups', run(() => store.findAll('filterGroup')));
    this.set('filters', A([]));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('initializes filters to not-selected', async function(assert) {
    await render(hbs`
      {{record-filters-edit filterGroups=filterGroups filters=filters}}
    `);

    // Test `filters` value
    assert.deepEqual(this.get('filters').length, 0);

    // Test the text of each select box.
    // The first span within `.ember-power-select-trigger` should contain
    // either the placeholder text or the selection text, while not containing
    // the little x which lets you clear the selection.
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupB.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
  });

  test('can choose a filter for one group while leaving the other blank', async function(assert) {
    await render(hbs`
      {{record-filters-edit filterGroups=filterGroups filters=filters}}
    `);

    // Pick one filter
    await selectChoose(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger`, "Filter A1");

    // Test `filters` value
    assert.deepEqual(this.get('filters').length, 1);
    assert.deepEqual(this.get('filters').objectAt(0).id, this.filterA1.id);

    // Test the text of each select box
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Filter A1");
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupB.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
  });

  test('can choose filters in both groups', async function(assert) {
    await render(hbs`
      {{record-filters-edit filterGroups=filterGroups filters=filters}}
    `);

    // Pick both filters
    await selectChoose(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger`, "Filter A1");
    await selectChoose(`div.filter-group-${this.groupB.id}-select .ember-power-select-trigger`, "Filter B2");

    // Test `filters` value
    assert.deepEqual(this.get('filters').length, 2);
    assert.deepEqual(this.get('filters').objectAt(0).id, this.filterA1.id);
    assert.deepEqual(this.get('filters').objectAt(1).id, this.filterB2.id);

    // Test the text of each select box
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Filter A1");
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupB.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Filter B2");
  });

  test('can clear a selected filter', async function(assert) {
    await render(hbs`
      {{record-filters-edit filterGroups=filterGroups filters=filters}}
    `);

    // Pick a filter
    await selectChoose(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger`, "Filter A1");

    // Test `filters` value
    assert.deepEqual(this.get('filters').length, 1);
    assert.deepEqual(this.get('filters').objectAt(0).id, this.filterA1.id);
    // Test text
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Filter A1");

    // Clear the selection
    await clearSelected(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger`);

    // Test `filters` value
    assert.deepEqual(this.get('filters').length, 0);
    // Test text
    assert.equal(this.element.querySelector(`div.filter-group-${this.groupA.id}-select .ember-power-select-trigger > span:first-child`).textContent.trim(), "Not selected");
  });
});
