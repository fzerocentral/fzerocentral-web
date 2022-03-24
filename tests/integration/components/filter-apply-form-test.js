import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance, modelAsProperty }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { assertPowerSelectOptionsEqual, assertPowerSelectCurrentTextEqual }
  from 'fzerocentral-web/tests/helpers/power-select-helpers';

function getFilterGroupSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[0];
}

function getCompareMethodSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[1];
}

function getFilterSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[2];
}

module('Integration | Component | filter-apply-form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.machineGroup = createModelInstance(
      this.server, 'filterGroup',
      {name: 'Machine', kind: 'select'});
    this.blueFalconFilter = createModelInstance(
      this.server, 'filter',
      {name: 'Blue Falcon', filterGroup: this.machineGroup});
    this.whiteCatFilter = createModelInstance(
      this.server, 'filter',
      {name: 'White Cat', filterGroup: this.machineGroup});

    this.settingGroup = createModelInstance(
      this.server, 'filterGroup',
      {name: 'Setting', kind: 'numeric'});
    this.setting30Filter = createModelInstance(
      this.server, 'filter',
      {name: '30%', numericValue: 30, filterGroup: this.settingGroup});
    this.setting80Filter = createModelInstance(
      this.server, 'filter',
      {name: '80%', numericValue: 80, filterGroup: this.settingGroup});

    this.machineGroupAsProperty =
      modelAsProperty(this.store, 'filterGroup', this.machineGroup);
    this.settingGroupAsProperty =
      modelAsProperty(this.store, 'filterGroup', this.settingGroup);

    let filters = [
      this.blueFalconFilter, this.whiteCatFilter,
      this.setting30Filter, this.setting80Filter];
    this.filterAsMap = f => new Map([
      ['id', f.id], ['name', f.name],
      ['filterGroup', new Map([
        ['id', f.filterGroup.id], ['name', f.filterGroup.name],
      ])],
    ]);

    // Individual tests can set their property values; these just act as
    // defaults.
    this.set(
      'filterGroups',
      A([this.machineGroupAsProperty, this.settingGroupAsProperty]));
    this.set('appliedFiltersString', null);
    // In this component test, we don't have query params which bubble up
    // to a route to subsequently update appliedFilterObjs. So we have to
    // manually set it here.
    // This is a bit of a hack; we just set appliedFilterObjs to all of the
    // possible filters. It's supposed to be just the filters in the
    // afs, but in this test it's hard to make that work.
    // TODO: Think of a better way, maybe by having the route not rely on
    // a separate query to update appliedFilterObjs.
    this.set(
      'appliedFilterObjs', filters.map(filter => this.filterAsMap(filter)));
    this.set(
      'updateAppliedFiltersString',
      (s) => this.set('appliedFiltersString', s));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test("first dropdown has the filter groups", async function(assert) {
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}} />`);

    let filterGroupSelect = getFilterGroupSelect(this);
    await assertPowerSelectOptionsEqual(
      assert, filterGroupSelect, ["Machine", "Setting"],
      "Options are as expected");
    assertPowerSelectCurrentTextEqual(
      assert, filterGroupSelect, "Not selected",
      "Default selection is as expected");
  });

  test("selecting a filter group fills the second dropdown with relevant compare options", async function(assert) {
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}} />`);

    let filterGroupSelect = getFilterGroupSelect(this);
    let compareMethodSelect = getCompareMethodSelect(this);

    await selectChoose(filterGroupSelect, 'Machine');
    await assertPowerSelectOptionsEqual(
      assert, compareMethodSelect, ["is", "is NOT"],
      "Choice-based filter group: options are as expected");
    assertPowerSelectCurrentTextEqual(
      assert, compareMethodSelect, "is",
      "Choice-based filter group: default selection is as expected");

    // Numeric filter group
    await selectChoose(filterGroupSelect, 'Setting');
    await assertPowerSelectOptionsEqual(
      assert, compareMethodSelect, ["is", "is NOT", ">=", "<="],
      "Numeric filter group: options are as expected");
    assertPowerSelectCurrentTextEqual(
      assert, compareMethodSelect, "is",
      "Numeric filter group: default selection is as expected");
  });

  test("selecting a filter group fills the third dropdown with the group's filter options", async function(assert) {
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}} />`);

    let filterGroupSelect = getFilterGroupSelect(this);
    let filterSelect = getFilterSelect(this);

    await selectChoose(filterGroupSelect, 'Machine');
    await assertPowerSelectOptionsEqual(
      assert, filterSelect, ["Blue Falcon", "White Cat"],
      "Choice-based filter group: options are as expected");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "Not selected",
      "Choice-based filter group: default selection is as expected");

    await selectChoose(filterGroupSelect, 'Setting');
    await assertPowerSelectOptionsEqual(
      assert, filterSelect, ["30%", "80%"],
      "Numeric filter group: options are as expected");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "Not selected",
      "Numeric filter group: default selection is as expected");
  });

  test("changing the filter group resets the other dropdowns as needed", async function(assert) {
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}} />`);

    let filterGroupSelect = getFilterGroupSelect(this);
    let compareMethodSelect = getCompareMethodSelect(this);
    let filterSelect = getFilterSelect(this);

    await selectChoose(filterGroupSelect, 'Setting');
    await selectChoose(compareMethodSelect, '<=');
    await selectChoose(filterSelect, '80%');

    assertPowerSelectCurrentTextEqual(
      assert, compareMethodSelect, "<=",
      "Compare method should be set as expected");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "80%",
      "Filter selection should be set as expected");

    // Change to a filter group where <= doesn't apply, and 80% doesn't apply
    await selectChoose(filterGroupSelect, 'Machine');
    assertPowerSelectCurrentTextEqual(
      assert, compareMethodSelect, "is",
      "Compare method should be reset as expected");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "Not selected",
      "Filter selection should be reset as expected");
  });

  test("adding a filter calls updateAppliedFiltersString with an appropriate updated filters string", async function(assert) {
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}}
            @updateAppliedFiltersString={{updateAppliedFiltersString}} />`);

    let filterGroupSelect = getFilterGroupSelect(this);
    let compareMethodSelect = getCompareMethodSelect(this);
    let filterSelect = getFilterSelect(this);

    await selectChoose(filterGroupSelect, 'Machine');
    await selectChoose(compareMethodSelect, 'is');
    await selectChoose(filterSelect, 'White Cat');
    await click(`button.add-filter-button`);
    let expectedAFString = `${this.whiteCatFilter.id}`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Works for equality comparison");

    await selectChoose(filterGroupSelect, 'Machine');
    await selectChoose(compareMethodSelect, 'is NOT');
    await selectChoose(filterSelect, 'Blue Falcon');
    await click(`button.add-filter-button`);
    expectedAFString += `-${this.blueFalconFilter.id}n`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Works for NOT comparison");

    await selectChoose(filterGroupSelect, 'Setting');
    await selectChoose(compareMethodSelect, '>=');
    await selectChoose(filterSelect, '80%');
    await click(`button.add-filter-button`);
    expectedAFString += `-${this.setting80Filter.id}ge`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Works for greater-or-equal comparison");

    await selectChoose(filterGroupSelect, 'Setting');
    await selectChoose(compareMethodSelect, '<=');
    await selectChoose(filterSelect, '30%');
    await click(`button.add-filter-button`);
    expectedAFString += `-${this.setting30Filter.id}le`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Works for less-or-equal comparison");
  });

  test("each part of appliedFiltersString gets a human-readable display after 'Applied filters:'", async function(assert) {
    let appliedFiltersString =
      `${this.whiteCatFilter.id}`
      + `-${this.blueFalconFilter.id}n`
      + `-${this.setting80Filter.id}ge`
      + `-${this.setting30Filter.id}le`;
    this.set('appliedFiltersString', appliedFiltersString);

    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}}
            @updateAppliedFiltersString={{updateAppliedFiltersString}} />`);

    let appliedFilterDisplays =
      Array.from(this.element.querySelectorAll('span.applied-filter'))
      .map(element => element.textContent.trim());
    let expectedAFDisplays = [
      "Machine: White Cat", "Machine: NOT Blue Falcon",
      "Setting: >= 80%", "Setting: <= 30%"];
    assert.deepEqual(
      appliedFilterDisplays, expectedAFDisplays,
      "Displayed text is as expected");
  });

  test("clicking the remove button next to an applied-filter display removes that filter, calling updateAppliedFiltersString() with the appropriate new string", async function(assert) {
    let appliedFiltersString =
      `${this.whiteCatFilter.id}`
      + `-${this.blueFalconFilter.id}n`
      + `-${this.setting30Filter.id}le`;
    this.set('appliedFiltersString', appliedFiltersString);
    await render(
      hbs`<FilterApplyForm @filterGroups={{filterGroups}}
            @appliedFilterObjs={{appliedFilterObjs}}
            @appliedFiltersString={{appliedFiltersString}}
            @updateAppliedFiltersString={{updateAppliedFiltersString}} />`);

    let removeButtons =
      this.element.querySelectorAll('button.applied-filter-remove-button');
    await click(removeButtons[1]);
    let expectedAFString =
      `${this.whiteCatFilter.id}`
      + `-${this.setting30Filter.id}le`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Properly updated after 1st removal");

    removeButtons =
      this.element.querySelectorAll('button.applied-filter-remove-button');
    await click(removeButtons[0]);
    expectedAFString =
      `${this.setting30Filter.id}le`;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Properly updated after 2nd removal");

    removeButtons =
      this.element.querySelectorAll('button.applied-filter-remove-button');
    await click(removeButtons[0]);
    expectedAFString = null;
    assert.equal(
      this.get('appliedFiltersString'), expectedAFString,
      "Properly updated after 3rd removal");
  });
});
