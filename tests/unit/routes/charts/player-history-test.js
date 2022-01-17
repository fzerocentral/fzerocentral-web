import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, visit } from "@ember/test-helpers";
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


module('Unit | Route | charts/player-history', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.player = createModelInstance(this.server, 'player', {username: "Player A"});
    let game = createModelInstance(this.server, 'game', {name: "Game 1"});
    let chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: "Group 1", game: game, show_charts_together: true});
    let chartType = createModelInstance(
      this.server, 'chart-type',
      {
        name: "Type 1", format_spec: '[{"suffix": "m"}]',
        order_ascending: true, game: game
      });
    this.chart = createModelInstance(
      this.server, 'chart',
      {name: "Chart 1", chartType: chartType, chartGroup: chartGroup});

    this.machineFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Machine', kind: 'select', showByDefault: true});
    this.settingFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Setting', kind: 'numeric', showByDefault: false});

    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: chartType, filterGroup: this.machineFG});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: chartType, filterGroup: this.settingFG});

    this.apiPath = `/charts/${this.chart.id}/record_history/`;
    this.apiExpectedParams = {
      player_id: this.player.id,
      filters: '',
      'page[size]': '50',
    };
  });

  hooks.afterEach( function() {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/player-history');
    assert.ok(route);
  });

  test("should make the expected API request for records", async function(assert) {
    // Mock window.fetch(), setting a flag when the API is
    // called with the expected URL and params.
    let called = false;
    fetchMock.get(
      {url: 'path:' + this.apiPath, query: this.apiExpectedParams},
      () => {called = true; return {data: []};},
    );

    await visit(`/charts/${this.chart.id}/players/${this.player.id}/history`);

    assert.ok(
      called, "API call should have been made with expected URL and params");
  });

  test("records table should list record details", async function(assert) {
    // Mock window.fetch() to get a particular result from the API call.
    fetchMock.get(
      {url: 'path:' + this.apiPath, query: this.apiExpectedParams},
      () => {
        return {data: [
          {value_display: "70m", date_achieved: new Date(2003, 0), filters: []},
          {value_display: "60m", date_achieved: new Date(2002, 0), filters: []},
        ]};
      },
    );

    await visit(`/charts/${this.chart.id}/players/${this.player.id}/history`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    let [valueCell, dateCell] = rows[1].querySelectorAll('td');
    assert.equal(
      valueCell.textContent.trim(), "70m", "Value should be as expected");
    assert.equal(
      dateCell.textContent.trim(), "2003-01-01 00:00",
      "Date should be as expected");
    [valueCell, dateCell] = rows[2].querySelectorAll('td');
    assert.equal(
      valueCell.textContent.trim(), "60m", "Value should be as expected");
    assert.equal(
      dateCell.textContent.trim(), "2002-01-01 00:00",
      "Date should be as expected");
  });

  test("records table should have one column per shown filter group", async function(assert) {
    await visit(`/charts/${this.chart.id}/players/${this.player.id}/history`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Record", "Date", "Machine"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected with only default filter groups shown");

    // Check
    await click('input[name="showAllFilterGroups"]');

    firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    expectedTableHeaders = [
      "Record", "Date", "Machine", "Setting"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected with all filter groups shown");

    // Uncheck
    await click('input[name="showAllFilterGroups"]');

    firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    expectedTableHeaders = [
      "Record", "Date", "Machine"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected with only default filter groups shown");
  });
});
