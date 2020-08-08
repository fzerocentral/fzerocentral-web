import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import {
  default as window,
  reset as windowMockReset
} from 'ember-window-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { getURLSearchParamsHash }
  from 'fzerocentral-web/tests/helpers/route-helpers';


function getChartTypeFGsTableRowByName(rootElement, name) {
  let chartTypeFGsTable = rootElement.querySelector('table.chart-type-fgs');
  if (!chartTypeFGsTable) {
    // The table isn't present if the CT has no FGs
    return undefined;
  }

  let rows = chartTypeFGsTable.querySelectorAll('tr');
  // Return the first row which has this name; if no match, undefined
  return Array.from(rows).find((row) => {
    let nameAndLinkCell = row.querySelectorAll('td')[2];
    if (!nameAndLinkCell) {
      // Probably the header row, which has th instead of td
      return false;
    }
    return (
      nameAndLinkCell.querySelector('a').textContent.trim() === name);
  });
}

function getGameFGsListItemByName(rootElement, name) {
  let gameFGsList = rootElement.querySelector('ul.game-fgs');
  if (!gameFGsList) {
    // The list isn't present if the game has no other FGs
    return undefined;
  }

  let listItems = gameFGsList.querySelectorAll('li');
  // Return the first list item which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('a').textContent.trim() === name;
  });
}

function getOrphanedFGsListItemByName(rootElement, name) {
  let orphanedFGsList = rootElement.querySelector('ul.orphaned-fgs');
  if (!orphanedFGsList) {
    // The list isn't present if there are no orphaned FGs
    return undefined;
  }

  let listItems = orphanedFGsList.querySelectorAll('li');
  // Return the first list item which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('a').textContent.trim() === name;
  });
}


module('Unit | Route | chart-types/filter-groups', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');
    windowMockReset();

    this.game = createModelInstance(this.server, 'game', {name: "Game 1"});
    this.otherGame = createModelInstance(this.server, 'game', {name: "Other"});
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
      order_ascending: true, game: this.otherGame});

    this.filterGroupA = createModelInstance(
      this.server, 'filter-group',
      {name: 'Group A', kind: 'select', showByDefault: true});
    this.filterGroupB = createModelInstance(
      this.server, 'filter-group',
      {name: 'Group B', kind: 'select', showByDefault: true});
    this.filterGroupC = createModelInstance(
      this.server, 'filter-group',
      {name: 'Group C', kind: 'select', showByDefault: false});
    this.filterGroupD = createModelInstance(
      this.server, 'filter-group',
      {name: 'Group D', kind: 'select', showByDefault: false});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:chart-types/filter-groups');
    assert.ok(route, "Route exists");
  });

  test("can be visited", async function(assert){
    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);
    assert.equal(
      currentURL(), `/chart-types/${this.chartType1.id}/filter-groups`,
      "URL is correct");
  });

  test("makes the expected API requests for filter groups", async function(assert){
    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let thisChartTypeFGsRequest =
      this.server.pretender.handledRequests.find((request) => {
        let params = getURLSearchParamsHash(request.url);
        return (
          request.url.startsWith('/filter_groups?')
          && Object.prototype.hasOwnProperty.call(params, 'chart_type_id')
          && params['chart_type_id'] !== ''
          && request.method === 'GET');
      });
    assert.ok(
      thisChartTypeFGsRequest,
      "API call was made for this chart type's filter groups");
    let actualParams = getURLSearchParamsHash(thisChartTypeFGsRequest.url);
    let expectedParams = {
      chart_type_id: this.chartType1.id,
    };
    assert.deepEqual(
      actualParams, expectedParams, "Call params were as expected");

    let gameFGsRequest =
      this.server.pretender.handledRequests.find((request) => {
        let params = getURLSearchParamsHash(request.url);
        return (
          request.url.startsWith('/filter_groups?')
          && Object.prototype.hasOwnProperty.call(params, 'game_id')
          && request.method === 'GET');
      });
    assert.ok(
      gameFGsRequest,
      "API call was made for filter groups in this game");
    actualParams = getURLSearchParamsHash(gameFGsRequest.url);
    expectedParams = {
      game_id: this.game.id,
    };
    assert.deepEqual(
      actualParams, expectedParams, "Call params were as expected");

    let orphanedFGsRequest =
      this.server.pretender.handledRequests.find((request) => {
        let params = getURLSearchParamsHash(request.url);
        return (
          request.url.startsWith('/filter_groups?')
          && Object.prototype.hasOwnProperty.call(params, 'chart_type_id')
          && params['chart_type_id'] === ''
          && request.method === 'GET');
      });
    assert.ok(
      orphanedFGsRequest,
      "API call was made for orphaned filter groups");
    actualParams = getURLSearchParamsHash(orphanedFGsRequest.url);
    expectedParams = {
      chart_type_id: '',
    };
    assert.deepEqual(
      actualParams, expectedParams, "Call params were as expected");
  });

  test("has filter group details in the chart type's FG table", async function(assert){
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA,
       orderInChartType: 1, showByDefault: true});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupB,
       orderInChartType: 2, showByDefault: false});
    // This is in a different chart type, and thus should not be shown in the
    // table
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType2, filterGroup: this.filterGroupC,
       orderInChartType: 3, showByDefault: false});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row = getChartTypeFGsTableRowByName(
      this.element, this.filterGroupA.name);
    assert.ok(row, "Group A is in the chart type's FGs table");

    let orderField = row.querySelectorAll('td')[1].querySelector('input');
    assert.equal(
      orderField.value, "1",
      "Group A's displayed order is as expected")
    let link = row.querySelectorAll('td')[2].querySelector('a');
    assert.dom(link).hasText(this.filterGroupA.name, "Group A's displayed name is as expected");
    assert.equal(
      link.getAttribute('href'), `/filter-groups/${this.filterGroupA.id}`,
      "Group A's link href is as expected");
    let showByDefaultCheckbox =
      row.querySelectorAll('td')[3].querySelector('input.show-input');
    assert.equal(
      showByDefaultCheckbox.checked, true,
      "Group A's show-by-default checkbox is ticked");

    row = getChartTypeFGsTableRowByName(this.element, this.filterGroupB.name);
    assert.ok(row, "Group B is in the chart type's FGs table");

    orderField = row.querySelectorAll('td')[1].querySelector('input');
    assert.equal(
      orderField.value, "2",
      "Group B's displayed order is as expected")
    link = row.querySelectorAll('td')[2].querySelector('a');
    assert.dom(link).hasText(this.filterGroupB.name, "Group B's displayed name is as expected");
    assert.equal(
      link.getAttribute('href'), `/filter-groups/${this.filterGroupB.id}`,
      "Group B's link href is as expected");
    showByDefaultCheckbox =
      row.querySelectorAll('td')[3].querySelector('input.show-input');
    assert.equal(
      showByDefaultCheckbox.checked, false,
      "Group B's show-by-default checkbox is unticked");

    row = getChartTypeFGsTableRowByName(this.element, this.filterGroupC.name);
    assert.notOk(row, "Group C is not in the chart type's FGs table");
  });

  test("can create new filter group", async function(assert){
    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    // Fill fields.
    fillIn('.name-input', 'New Group');
    await selectChoose('div.kind-select > .ember-power-select-trigger', 'select');
    fillIn('.description-input', 'A description');
    // Submit form.
    await click('button.create-button');

    // Filter group should be created
    let filterGroups = run(() => this.store.findAll('filter-group'));
    let newFilterGroup = filterGroups.find((fg) => {
      return fg.get('name') === 'New Group';
    });
    assert.ok(
      newFilterGroup, "New filter group was created with the expected name");
    assert.equal(
      newFilterGroup.get('kind'), 'select', "Has the expected 'kind' value");
    assert.equal(
      newFilterGroup.get('description'), 'A description',
      "Has the expected description");

    // CT-FG link should be created. Don't worry about non-FK field values
    // such as order, since that's API logic.
    let ctfgs = run(() => this.store.findAll('chart-type-filter-group'));
    let newCtfg = ctfgs.find((ctfg) => {
      return ctfg.get('chartType').get('id') === this.chartType1.id
        && ctfg.get('filterGroup').get('id') === newFilterGroup.id;
    });
    assert.ok(newCtfg, "Expected CT-FG link was created");

    // Filter group should be on the list (list should have been refreshed)
    assert.ok(
      getChartTypeFGsTableRowByName(this.element, 'New Group'),
      "New group is in the chart type's FGs table");
  });

  test("can add another filter group from this game to this chart type", async function(assert){
    // Add an FG to another chart type in the same game
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType2, filterGroup: this.filterGroupB});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    assert.notOk(
      getChartTypeFGsTableRowByName(this.element, this.filterGroupB.name),
      "Group B is not yet in the chart type's FGs table");
    let gameFGsListItem = getGameFGsListItemByName(
      this.element, this.filterGroupB.name);
    assert.ok(
      gameFGsListItem,
      "Group B is in the game's FGs list");

    await click(gameFGsListItem.querySelector('button.link-fg-button'));

    assert.ok(
      getChartTypeFGsTableRowByName(this.element, this.filterGroupB.name),
      "Now Group B is in the chart type's FGs table");
    assert.notOk(
      getGameFGsListItemByName(this.element, this.filterGroupB.name),
      "Now Group B is not in the game's FGs list");
  });

  test("can add an orphaned filter group to this chart type", async function(assert){
    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    assert.notOk(
      getChartTypeFGsTableRowByName(this.element, this.filterGroupB.name),
      "Group B is not yet in the chart type's FGs table");
    let orphanedFGsListItem = getOrphanedFGsListItemByName(
      this.element, this.filterGroupB.name);
    assert.ok(
      orphanedFGsListItem,
      "Group B is in the orphaned FGs list");

    await click(orphanedFGsListItem.querySelector('button.link-fg-button'));

    assert.ok(
      getChartTypeFGsTableRowByName(this.element, this.filterGroupB.name),
      "Now Group B is in the chart type's FGs table");
    assert.notOk(
      getOrphanedFGsListItemByName(this.element, this.filterGroupB.name),
      "Now Group B is not in the orphaned FGs list");
  });

  test("can remove a filter group from this chart type, when the FG still belongs to another chart type in the same game", async function(assert){
    // Add the same filter group to two chart types of the same game
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType2, filterGroup: this.filterGroupA});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    assert.ok(row, "Group A is in the chart type's FGs table");
    assert.notOk(
      getGameFGsListItemByName(this.element, this.filterGroupA.name),
      "Group A is not in the game FGs list");

    await click(row.querySelector('button.unlink-fg-button'));

    assert.notOk(
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name),
      "Now Group A is not in the chart type's FGs table");
    assert.ok(
      getGameFGsListItemByName(this.element, this.filterGroupA.name),
      "Now Group A is in the game FGs list");
  });

  test("unlink a filter group that belongs to no other chart type, then cancel the confirmation", async function(assert){
    // Automatically cancel any window confirmations.
    let confirmFalseStub = sinon.stub(window, 'confirm');
    confirmFalseStub.returns(false);

    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    // Click the unlink button; the window confirmation should get canceled.
    await click(row.querySelector('button.unlink-fg-button'));

    row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    assert.ok(row, "Group A is still in the chart type's FGs table");
  });

  test("unlink a filter group that belongs to no other chart type, then confirm the confirmation", async function(assert){
    // Automatically confirm any window confirmations.
    let confirmFalseStub = sinon.stub(window, 'confirm');
    confirmFalseStub.returns(true);

    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    // Click the unlink button; the window confirmation should get confirmed.
    await click(row.querySelector('button.unlink-fg-button'));

    row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    assert.notOk(row, "Now Group A is not in the chart type's FGs table");
    let listItem =
      getOrphanedFGsListItemByName(this.element, this.filterGroupA.name);
    assert.notOk(listItem, "Group A is not in the orphaned FGs list");
  });

  test("can change the 'show by default' option of a CT-FG link using the checkbox", async function(assert){
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA,
       showByDefault: false});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    await click(row.querySelector('input.show-input'));

    let ctfgs = run(() => this.store.findAll('chart-type-filter-group'));
    let thisCtfg = ctfgs.find((ctfg) => {
      return ctfg.get('chartType').get('id') === this.chartType1.id
        && ctfg.get('filterGroup').get('id') === this.filterGroupA.id;
    });
    assert.equal(
      thisCtfg.get('showByDefault'), true, "showByDefault is now true");

    await click(row.querySelector('input.show-input'));

    ctfgs = run(() => this.store.findAll('chart-type-filter-group'));
    thisCtfg = ctfgs.find((ctfg) => {
      return ctfg.get('chartType').get('id') === this.chartType1.id
        && ctfg.get('filterGroup').get('id') === this.filterGroupA.id;
    });
    assert.equal(
      thisCtfg.get('showByDefault'), false, "showByDefault is now false");
  });

  test("can change the order number of a CT-FG link using the text field", async function(assert){
    // Old: A = 1, B = 2. New: A = 2, B we don't care (the real API should
    // change B to 1, but we won't implement such logic in Mirage).
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupA,
       orderInChartType: 1});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType1, filterGroup: this.filterGroupB,
       orderInChartType: 2});

    await visit(`/chart-types/${this.chartType1.id}/filter-groups`);

    let row =
      getChartTypeFGsTableRowByName(this.element, this.filterGroupA.name);
    await fillIn(row.querySelector('input.order-input'), 2);

    let ctfgs = run(() => this.store.findAll('chart-type-filter-group'));
    let thisCtfg = ctfgs.find((ctfg) => {
      return ctfg.get('chartType').get('id') === this.chartType1.id
        && ctfg.get('filterGroup').get('id') === this.filterGroupA.id;
    });
    assert.equal(
      thisCtfg.get('orderInChartType'), 2, "orderInChartType has been updated");
  });
});
