import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, visit } from "@ember/test-helpers";
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';

module('Unit | Route | charts/top-record-history', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.user = createModelInstance(this.server, 'user', {username: "User A"});
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
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/top-record-history');
    assert.ok(route);
  });

  test("records table has one column per shown filter group", async function(assert) {
    await visit(`/charts/${this.chart.id}/top-record-history`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Player", "Record", "Date", "Machine"];
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
      "Player", "Record", "Date", "Machine", "Setting"];
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
      "Player", "Record", "Date", "Machine"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected with only default filter groups shown");
  });
});
