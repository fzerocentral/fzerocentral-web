import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


function getFiltersListItemByName(rootElement, name) {
  let filtersList = rootElement.querySelector('ul.filter-list');
  let listItems = filtersList.querySelectorAll('li');
  // Return the first row which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('span').textContent.trim() === name;
  });
}

function getLinkTableRowByFilterNames(rootElement, implyingName, impliedName) {
  let tableBody =
    rootElement.querySelector('table.filter-implication-links-table tbody');
  let rows = tableBody.querySelectorAll('tr');
  // Return the first row which has these names; if no match, undefined
  return Array.from(rows).find((row) => {
    let implyingNameCell = row.querySelectorAll('td')[1];
    let impliedNameCell = row.querySelectorAll('td')[2];
    return (
      implyingNameCell.textContent.trim() === implyingName
      && impliedNameCell.textContent.trim() === impliedName);
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
      {name: "White Cat", filterGroup: this.filterGroup});
    createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup});
    createModelInstance(
      this.server, 'filter',
      {name: "30%", numericValue: 30, filterGroup: this.numericFilterGroup});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    assert.ok(
      getFiltersListItemByName(this.element, "Blue Falcon"),
      "Blue Falcon is on the list");
    assert.ok(
      getFiltersListItemByName(this.element, "White Cat"),
      "White Cat is on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "30%"),
      "30% is not on the list");
  });

  test("can create a new filter", async function(assert) {
    await visit(`/filter-groups/${this.filterGroup.id}`);

    let form = this.element.querySelector('.filter-create-form');
    let nameInput = form.querySelector('input[name="name"]');
    fillIn(nameInput, "Golden Fox");
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

    // Filter should be on the list (list should have been refreshed)
    assert.ok(
      getFiltersListItemByName(this.element, "Golden Fox"),
      "New filter is on the list");
  });

  test("lists the filter implication links in the filter group", async function(assert) {
    // Add some filters
    let gallantStarG4Filter = createModelInstance(
      this.server, 'filter',
      {name: "Gallant Star-G4", filterGroup: this.filterGroup});
    let dreadHammerFilter = createModelInstance(
      this.server, 'filter',
      {name: "Dread Hammer body", filterGroup: this.filterGroup});
    let titanG4Filter = createModelInstance(
      this.server, 'filter',
      {name: "Titan-G4 booster", filterGroup: this.filterGroup});
    let aCustomBodyFilter = createModelInstance(
      this.server, 'filter',
      {name: "A custom body", filterGroup: this.filterGroup});

    // Add some filter implication links
    createModelInstance(
      this.server, 'filter-implication-link',
      {implyingFilter: gallantStarG4Filter, impliedFilter: dreadHammerFilter});
    createModelInstance(
      this.server, 'filter-implication-link',
      {implyingFilter: gallantStarG4Filter, impliedFilter: titanG4Filter});
    createModelInstance(
      this.server, 'filter-implication-link',
      {implyingFilter: dreadHammerFilter, impliedFilter: aCustomBodyFilter});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    assert.ok(
      getLinkTableRowByFilterNames(
        this.element, "Gallant Star-G4", "Dread Hammer body"),
      "1st expected link is on the list");
    assert.ok(
      getLinkTableRowByFilterNames(
        this.element, "Gallant Star-G4", "Titan-G4 booster"),
      "1st expected link is on the list");
    assert.ok(
      getLinkTableRowByFilterNames(
        this.element, "Dread Hammer body", "A custom body"),
      "1st expected link is on the list");
  });

  test("can create a new filter implication link", async function(assert) {
    createModelInstance(
      this.server, 'filter',
      {name: "Gallant Star-G4", filterGroup: this.filterGroup});
    createModelInstance(
      this.server, 'filter',
      {name: "Dread Hammer body", filterGroup: this.filterGroup});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let form =
      this.element.querySelector('.filter-implication-link-create-form');
    let implyingSelect = form.querySelector(
      'div.implying-filter-select > .ember-power-select-trigger');
    await selectChoose(implyingSelect, "Gallant Star-G4");
    let impliedSelect = form.querySelector(
      'div.implied-filter-select > .ember-power-select-trigger');
    await selectChoose(impliedSelect, "Dread Hammer body");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    // Link should be created.
    let links = run(() => this.store.findAll('filter-implication-link'));
    let newLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Dread Hammer body");
    });
    assert.ok(newLink, "Expected link was created");

    // Link should be on the list (list should have been refreshed)
    assert.ok(
      getLinkTableRowByFilterNames(
        this.element, "Gallant Star-G4", "Dread Hammer body"),
      "New link is on the list");
  });

  test("can delete a filter implication link", async function(assert) {
    // Create filters and a link
    let gallantStarG4Filter = createModelInstance(
      this.server, 'filter',
      {name: "Gallant Star-G4", filterGroup: this.filterGroup});
    let dreadHammerFilter = createModelInstance(
      this.server, 'filter',
      {name: "Dread Hammer body", filterGroup: this.filterGroup});
    createModelInstance(
      this.server, 'filter-implication-link',
      {implyingFilter: gallantStarG4Filter, impliedFilter: dreadHammerFilter});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let row = getLinkTableRowByFilterNames(
      this.element, "Gallant Star-G4", "Dread Hammer body");
    let deleteButton = row.querySelector('.delete-button');
    await click(deleteButton);

    // Link should be deleted.
    let links = run(() => this.store.findAll('filter-implication-link'));
    let formerLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Dread Hammer body");
    });
    assert.notOk(formerLink, "Link does not exist anymore");

    // Link should no longer be on the list (list should have been refreshed)
    assert.notOk(
      getLinkTableRowByFilterNames(
        this.element, "Gallant Star-G4", "Dread Hammer body"),
      "Link is no longer on the list");
  });

  test("can show a filter's details", async function(assert) {
    createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let listItem = getFiltersListItemByName(this.element, "Blue Falcon");
    let detailButton = listItem.querySelector('.show-filter-detail-button');
    await click(detailButton);

    let detailSection = this.element.querySelector('.filter-detail-section');
    let detailSectionName =
      detailSection.querySelector('h2').textContent.trim();
    assert.equal(
      detailSectionName, "Blue Falcon",
      "Detail section shows the expected filter name");
  });

  test("can edit a filter using the detail area", async function(assert) {
    let blueFalconFilter = createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let listItem = getFiltersListItemByName(this.element, "Blue Falcon");
    let detailButton = listItem.querySelector('.show-filter-detail-button');
    await click(detailButton);

    // Change filter name
    let detailSection = this.element.querySelector('.filter-detail-section');
    let nameInput = detailSection.querySelector('input[name="name"]');
    fillIn(nameInput, "Golden Fox");
    let saveButton = detailSection.querySelector('.save-button');
    await click(saveButton);

    let filters = run(() => this.store.findAll('filter'));
    let changedFilter = filters.find((filter) => {
      return filter.get('id') === blueFalconFilter.id;
    });
    assert.equal(
      changedFilter.get('name'), "Golden Fox",
      "Filter name was changed as expected");
  });

  test("can delete a filter using the detail area", async function(assert) {
    createModelInstance(
      this.server, 'filter',
      {name: "Blue Falcon", filterGroup: this.filterGroup});

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let listItem = getFiltersListItemByName(this.element, "Blue Falcon");
    let detailButton = listItem.querySelector('.show-filter-detail-button');
    await click(detailButton);

    // Delete filter
    let detailSection = this.element.querySelector('.filter-detail-section');
    let deleteButton = detailSection.querySelector('.delete-button');
    await click(deleteButton);

    let filters = run(() => this.store.findAll('filter'));
    let formerFilter = filters.find((filter) => {
      return filter.get('name') === "Blue Falcon";
    });
    // Note: If this assertion fails, it might fail with a
    // `this.get(...).internalModel is undefined` error instead of a regular
    // assertion error. No idea why.
    assert.notOk(formerFilter, "Filter was deleted")
  });
});
