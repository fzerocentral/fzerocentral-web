import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


function getFiltersListItemByName(rootElement, name, type='choosable') {
  let filtersList = null;
  if (type === 'choosable') {
    filtersList = rootElement.querySelector('ul.choosable-filter-list');
  }
  else {
    filtersList = rootElement.querySelector('ul.implied-filter-list');
  }

  let listItems = filtersList.querySelectorAll('li');
  // Return the first row which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('button').textContent.trim() === name;
  });
}


module('Unit | Route | filter-groups/show', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', {name: "Game 1"});

    this.filterGroup = createModelInstance(
      this.server, 'filter-group',
      {name: "Machine", kind: 'select', showByDefault: true});
    this.numericFilterGroup = createModelInstance(
      this.server, 'filter-group',
      {name: "Setting", kind: 'numeric', showByDefault: true});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test("it exists", function(assert) {
    let route = this.owner.lookup('route:filter-groups/show');
    assert.ok(route, "Route exists");
  });

  test("can be visited", async function(assert){
    await visit(`/filter-groups/${this.filterGroup.id}`);
    assert.equal(
      currentURL(), `/filter-groups/${this.filterGroup.id}`,
      "URL is correct");
  });

  test("lists the chart types that use the filter group", async function(assert) {
    // We'll have 2 chart types using the filter group, and 1 chart type not
    // using it.
    this.chartType1 = createModelInstance(
      this.server, 'chart-type',
      {name: "Type 1", format_spec: '[{"suffix": "m"}]',
      order_ascending: true, game: this.game});
    this.chartType2 = createModelInstance(
      this.server, 'chart-type',
      {name: "Type 2", format_spec: '[{"suffix": "pts"}]',
      order_ascending: true, game: this.game});
    this.otherChartType = createModelInstance(
      this.server, 'chart-type',
      {name: "Other Type", format_spec: '[{"suffix": "km"}]',
      order_ascending: true, game: this.game});

    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroup,
       orderInChartType: 1, showByDefault: true});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType2, filterGroup: this.filterGroup,
       orderInChartType: 1, showByDefault: true});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let chartTypesList = this.element.querySelector('ul.chart-type-list');
    let listItems = chartTypesList.querySelectorAll('li');
    // We use `sort()` to be order-agnostic.
    let listItemsTexts = Array.from(listItems)
      .map(listItem => listItem.querySelector('a').textContent.trim())
      .sort();
    assert.deepEqual(
      listItemsTexts, ["Type 1", "Type 2"],
      "Listed chart types are as expected");
  });

  test("lists the filters in the filter group", async function(assert) {
    // 2 filters in the filter group we'll check, 1 filter in another group
    createModelInstance(
      this.server, 'filter',
      {name: "White Cat", filterGroup: this.filterGroup,
       usageType: 'choosable'});
    createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup,
       usageType: 'choosable'});
    createModelInstance(
      this.server, 'filter',
      {name: "Custom", filterGroup: this.filterGroup,
       usageType: 'implied'});
    createModelInstance(
      this.server, 'filter',
      {name: "Non-Custom", filterGroup: this.filterGroup,
       usageType: 'implied'});
    createModelInstance(
      this.server, 'filter',
      {name: "30%", numericValue: 30, filterGroup: this.numericFilterGroup,
       usageType: 'choosable'});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    assert.ok(
      getFiltersListItemByName(this.element, "Blue Falcon", 'choosable'),
      "Blue Falcon is on the choosable list");
    assert.ok(
      getFiltersListItemByName(this.element, "White Cat", 'choosable'),
      "White Cat is on the choosable list");
    assert.ok(
      getFiltersListItemByName(this.element, "Custom", 'implied'),
      "Custom is on the implied list");
    assert.ok(
      getFiltersListItemByName(this.element, "Non-Custom", 'implied'),
      "Non-Custom is on the implied list");
    assert.notOk(
      getFiltersListItemByName(this.element, "30%", 'choosable'),
      "30% is not on the choosable list");
  });

  test("can create a new filter", async function(assert) {
    await visit(`/filter-groups/${this.filterGroup.id}`);

    let form = this.element.querySelector('.filter-create-form');
    let nameInput = form.querySelector('input[name="name"]');
    fillIn(nameInput, "Golden Fox");
    // We won't test the usage type's default value, since that's API logic,
    // not Ember logic.
    let typeSelect = form.querySelector(
      'div.type-field > .ember-power-select-trigger');
    await selectChoose(typeSelect, "implied");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    // Filter should be created.
    let filters = run(() => this.store.findAll('filter'));
    let newFilter = filters.find((filter) => {
      return filter.get('name') === "Golden Fox";
    });
    assert.ok(newFilter, "Expected filter was created");
    assert.equal(
      newFilter.get('filterGroup').get('id'), this.filterGroup.id,
      "New filter has the correct filter group")
    assert.equal(
      newFilter.get('usageType'), 'implied',
      "New filter has the correct usage type")

    // Filter should be on the list (list should have been refreshed)
    assert.ok(
      getFiltersListItemByName(this.element, "Golden Fox"),
      "New filter is on the list");
  });

  test("can create a new numeric filter", async function(assert) {
    await visit(`/filter-groups/${this.numericFilterGroup.id}`);

    let form = this.element.querySelector('.filter-create-form');
    let nameInput = form.querySelector('input[name="name"]');
    fillIn(nameInput, "65%");
    let valueInput = form.querySelector('input[name="numeric-value"]');
    fillIn(valueInput, "65");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    // Filter should be created.
    let filters = run(() => this.store.findAll('filter'));
    let newFilter = filters.find((filter) => {
      return filter.get('name') === "65%";
    });
    assert.ok(newFilter, "Expected filter was created");
    assert.equal(
      newFilter.get('filterGroup').get('id'), this.numericFilterGroup.id,
      "New filter has the correct filter group")
    assert.equal(
      newFilter.get('numericValue'), 65,
      "New filter has the correct numeric value")

    // Filter should be on the list (list should have been refreshed)
    assert.ok(
      getFiltersListItemByName(this.element, "65%"),
      "New filter is on the list");
  });

  test("filter buttons change the selected filter", async function(assert) {
    createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup,
       usageType: 'choosable'});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let filterButton =
      getFiltersListItemByName(this.element, "Blue Falcon", 'choosable')
      .querySelector('button');
    await click(filterButton);

    // Check that the detail area shows the filter's details
    let filterDetailNameElement = this.element.querySelector(
      'div.filter-detail-section .filter-basic-fields > h2');
    assert.ok(
      filterDetailNameElement,
      "Filter detail section is filled out after clicking the filter button");
    let filterDetailName = filterDetailNameElement.textContent.trim();
    assert.equal(
      filterDetailName, "Blue Falcon", "Filter name display is as expected");
  });
});
