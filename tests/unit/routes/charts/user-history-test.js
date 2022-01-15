import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, visit } from "@ember/test-helpers";
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { getURLSearchParamsHash }
  from 'fzerocentral-web/tests/helpers/route-helpers';

module('Unit | Route | charts/user-history', function(hooks) {
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
    let route = this.owner.lookup('route:charts/user-history');
    assert.ok(route);
  });

  test("makes the expected API request for records", async function(assert) {
    await visit(`/charts/${this.chart.id}/users/${this.user.id}/history`);

    let recordsRequest =
      this.server.pretender.handledRequests.find((request) => {
        return (
          request.url.startsWith('/records/?')
          && request.method === 'GET');
      });
    assert.ok(recordsRequest, "Records API call was made");

    let actualParams = getURLSearchParamsHash(recordsRequest.url);
    let expectedParams = {
      chart_id: this.chart.id,
      user_id: this.user.id,
      improvements: 'flag',
      'page[size]': '1000',
      sort: 'date_achieved',
    };
    assert.deepEqual(actualParams, expectedParams, "Params were as expected");
  });

  test("records table lists records in order of date achieved", async function(assert) {
    // These records are defined such that ordering by create date or value
    // gives a 1-2-3 order, and ordering by achieve date gives a 2-3-1 order.
    // Thus, if the result respects 2-3-1 order, then we know it sorted by
    // achieve date.
    this.record2 = createModelInstance(this.server, 'record',
      {value: 70, valueDisplay: "70m", user: this.user, chart: this.chart,
       achievedAt: new Date(2002, 0)});
    this.record3 = createModelInstance(this.server, 'record',
      {value: 60, valueDisplay: "60m", user: this.user, chart: this.chart,
       achievedAt: new Date(2003, 0)});
    this.record1 = createModelInstance(this.server, 'record',
      {value: 50, valueDisplay: "50m", user: this.user, chart: this.chart,
       achievedAt: new Date(2001, 0)});

    await visit(`/charts/${this.chart.id}/users/${this.user.id}/history`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    let row1DateCell = rows[1].querySelectorAll('td')[1];
    assert.equal(
      row1DateCell.textContent.trim(), '2003-01-01 00:00', "Latest record first");
    let row2DateCell = rows[2].querySelectorAll('td')[1];
    assert.equal(
      row2DateCell.textContent.trim(), '2002-01-01 00:00', "Second-latest second");
    let row3DateCell = rows[3].querySelectorAll('td')[1];
    assert.equal(
      row3DateCell.textContent.trim(), '2001-01-01 00:00', "Earliest record last");
  });

  test("records table has one column per shown filter group", async function(assert) {
    await visit(`/charts/${this.chart.id}/users/${this.user.id}/history`);

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
