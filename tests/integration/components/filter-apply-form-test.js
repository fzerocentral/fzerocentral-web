import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, select } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import hbs from 'htmlbars-inline-precompile';
import { assertSelectOptionsEqual } from '../../utils/html';

function getFilterGroupSelect(rootElement) {
  return rootElement.querySelector('select[name="filter-group"]');
}

function getModifierSelect(rootElement) {
  return rootElement.querySelector('select[name="modifier"]');
}

function getFilterSelect(rootElement) {
  return rootElement.querySelector('#filter-select');
}

module('Integration | Component | filter-apply-form', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    let createFG = (args) => this.server.create('filter-group', args);
    let createF = (args) => this.server.create('filter', args);
    let g1 = createFG({ id: '1', name: 'G1', kind: 'select' });
    let g2 = createFG({ id: '2', name: 'G2', kind: 'numeric' });
    createF({ id: '1', name: 'F1', filterGroup: g1 });
    createF({ id: '2', name: 'F2', filterGroup: g1 });
    createF({ id: '3', name: 'F3', filterGroup: g2 });
    createF({ id: '4', name: 'F4', filterGroup: g2 });

    let store = this.owner.lookup('service:store');

    this.set('filterGroups', await store.findAll('filter-group'));
    // In this component test, we don't have query params which bubble up
    // to a route to subsequently update appliedFilterObjs. So we have to
    // manually set it here. We just set it to all possible filters.
    // If we wanted to test that appliedFilterObjs was being updated
    // properly, that'd have to be done in a route or controller test.
    this.set('appliedFilterObjs', await store.findAll('filter'));
    this.set('appliedFiltersString', null);
    this.set('getFilterOptions', (groupId) => {
      return store.query('filter', { filter_group_id: groupId });
    });
    this.set('updateAppliedFiltersString', (newStr) => {
      this.set('appliedFiltersString', newStr);
    });

    this.server.get('/filters', (schema, request) => {
      return schema.filters.where({
        filterGroupId: request.queryParams.filter_group_id,
      });
    });
  });

  test('first dropdown should have the filter groups', async function (assert) {
    assert.expect(2);

    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFiltersString={{this.appliedFiltersString}} />`
    );

    let filterGroupSelect = getFilterGroupSelect(this.element);
    assertSelectOptionsEqual(
      assert,
      filterGroupSelect,
      [
        ['', '-----'],
        ['1', 'G1'],
        ['2', 'G2'],
      ],
      'Options should be as expected'
    );
    assert.strictEqual(
      filterGroupSelect.value,
      '',
      'Default selection should be as expected'
    );
  });

  test('selecting a filter group should fill the second dropdown with relevant compare options', async function (assert) {
    assert.expect(4);

    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFiltersString={{this.appliedFiltersString}} />`
    );

    let filterGroupSelect = getFilterGroupSelect(this.element);
    let modifierSelect = getModifierSelect(this.element);

    await select(filterGroupSelect, '1');
    await assertSelectOptionsEqual(
      assert,
      modifierSelect,
      [
        ['', '='],
        ['n', 'NOT'],
      ],
      'Choice-based filter group: options should be as expected'
    );
    assert.strictEqual(
      modifierSelect.value,
      '',
      'Choice-based filter group: default selection should be as expected'
    );

    // Numeric filter group
    await select(filterGroupSelect, '2');
    await assertSelectOptionsEqual(
      assert,
      modifierSelect,
      [
        ['', '='],
        ['n', 'NOT'],
        ['ge', '>='],
        ['le', '<='],
      ],
      'Numeric filter group: options should be as expected'
    );
    assert.strictEqual(
      modifierSelect.value,
      '',
      'Numeric filter group: default selection should be as expected'
    );
  });

  test("selecting a filter group should fill the third dropdown with the group's filter options", async function (assert) {
    assert.expect(2);

    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFiltersString={{this.appliedFiltersString}} />`
    );

    let filterGroupSelect = getFilterGroupSelect(this.element);
    let filterSelect = getFilterSelect(this.element);

    await select(filterGroupSelect, '2');
    await assertSelectOptionsEqual(
      assert,
      filterSelect,
      [
        ['', '-----'],
        ['3', 'F3'],
        ['4', 'F4'],
      ],
      'Options should be as expected'
    );
    assert.strictEqual(
      filterSelect.value,
      '',
      'Default selection should be as expected'
    );
  });

  test('changing the filter group should reset the other dropdowns as needed', async function (assert) {
    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFiltersString={{this.appliedFiltersString}} />`
    );

    let filterGroupSelect = getFilterGroupSelect(this.element);
    let modifierSelect = getModifierSelect(this.element);
    let filterSelect = getFilterSelect(this.element);

    await select(filterGroupSelect, '2');
    await select(modifierSelect, 'le');
    await select(filterSelect, '3');

    assert.strictEqual(
      modifierSelect.value,
      'le',
      'Modifier should be set as expected'
    );
    assert.strictEqual(
      filterSelect.value,
      '3',
      'Filter selection should be set as expected'
    );

    // Change to a filter group where le doesn't apply, and 3 isn't a filter choice
    await select(filterGroupSelect, '1');

    assert.strictEqual(
      modifierSelect.value,
      '',
      'Modifier should be reset as expected'
    );
    assert.strictEqual(
      filterSelect.value,
      '',
      'Filter selection should be reset as expected'
    );
  });

  test('adding a filter should call updateAppliedFiltersString with an appropriate updated filters string', async function (assert) {
    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFilterObjs={{this.appliedFilterObjs}}
            @appliedFiltersString={{this.appliedFiltersString}}
            @updateAppliedFiltersString={{this.updateAppliedFiltersString}} />`
    );

    let filterGroupSelect = getFilterGroupSelect(this.element);
    let modifierSelect = getModifierSelect(this.element);
    let filterSelect = getFilterSelect(this.element);

    await select(filterGroupSelect, '1');
    await select(modifierSelect, '');
    await select(filterSelect, '1');
    await click('#filter-apply-form button');
    assert.strictEqual(this.appliedFiltersString, '1', 'Should work for =');

    await select(filterGroupSelect, '1');
    await select(modifierSelect, 'n');
    await select(filterSelect, '2');
    await click('#filter-apply-form button');
    assert.strictEqual(
      this.appliedFiltersString,
      '1-2n',
      'Should work for NOT'
    );

    await select(filterGroupSelect, '2');
    await select(modifierSelect, 'ge');
    await select(filterSelect, '3');
    await click('#filter-apply-form button');
    assert.strictEqual(
      this.appliedFiltersString,
      '1-2n-3ge',
      'Should work for >='
    );

    await select(filterGroupSelect, '2');
    await select(modifierSelect, 'le');
    await select(filterSelect, '4');
    await click('#filter-apply-form button');
    assert.strictEqual(
      this.appliedFiltersString,
      '1-2n-3ge-4le',
      'Should work for <='
    );
  });

  test("each part of appliedFiltersString should get a human-readable display after 'Applied filters:'", async function (assert) {
    this.set('appliedFiltersString', '1-2n-3ge-4le');

    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFilterObjs={{this.appliedFilterObjs}}
            @appliedFiltersString={{this.appliedFiltersString}}
            @updateAppliedFiltersString={{this.updateAppliedFiltersString}} />`
    );

    let appliedFilterDisplays = Array.from(
      this.element.querySelectorAll('span.applied-filter')
    ).map((element) => element.textContent.trim());
    let expectedAFDisplays = [
      'G1:  F1',
      'G1: NOT F2',
      'G2: >= F3',
      'G2: <= F4',
    ];
    assert.deepEqual(
      appliedFilterDisplays,
      expectedAFDisplays,
      'Displayed text should be as expected'
    );
  });

  test('clicking the remove button next to an applied-filter display removes that filter, calling updateAppliedFiltersString() with the appropriate new string', async function (assert) {
    this.set('appliedFiltersString', '1-2n-4le');

    await render(
      hbs`<FilterApplyForm
            @filterGroups={{this.filterGroups}}
            @appliedFilterObjs={{this.appliedFilterObjs}}
            @appliedFiltersString={{this.appliedFiltersString}}
            @updateAppliedFiltersString={{this.updateAppliedFiltersString}} />`
    );

    let removeButtons = this.element.querySelectorAll(
      'button.applied-filter-remove-button'
    );
    await click(removeButtons[1]);
    assert.strictEqual(
      this.appliedFiltersString,
      '1-4le',
      'Should be properly updated after 1st removal'
    );

    removeButtons = this.element.querySelectorAll(
      'button.applied-filter-remove-button'
    );
    await click(removeButtons[0]);
    assert.strictEqual(
      this.appliedFiltersString,
      '4le',
      'Should be properly updated after 2nd removal'
    );

    removeButtons = this.element.querySelectorAll(
      'button.applied-filter-remove-button'
    );
    await click(removeButtons[0]);
    assert.strictEqual(
      this.appliedFiltersString,
      null,
      'Should be properly updated after 3rd removal'
    );
  });
});
