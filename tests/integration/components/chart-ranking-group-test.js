import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';

module('Integration | Component | chart-ranking-group', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.userA = createModelInstance(this.server, 'user', {username: 'User A'});
    this.userB = createModelInstance(this.server, 'user', {username: 'User B'});
    this.game = createModelInstance(this.server, 'game', {name: 'Game 1'});
    this.chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: 'Group 1', game: this.game, show_charts_together: true});
    this.chartType = createModelInstance(
      this.server, 'chart-type',
      {name: 'Type 1',
      format_spec: '[{"suffix": "m"}]',
      order_ascending: true, game: this.game});
    this.chart1 = createModelInstance(this.server, 'chart',
      {name: 'Chart 1', chartType: this.chartType,
       chartGroup: this.chartGroup});
    this.chart2 = createModelInstance(this.server, 'chart',
      {name: 'Chart 2', chartType: this.chartType,
       chartGroup: this.chartGroup});

    this.recordA1 = createModelInstance(this.server, 'record',
      {value: 20, valueDisplay: "20m", user: this.userA, chart: this.chart1,
       rank: 1});
    this.recordB1 = createModelInstance(this.server, 'record',
      {value: 25, valueDisplay: "25m", user: this.userB, chart: this.chart1,
       rank: 2});
    this.recordA2 = createModelInstance(this.server, 'record',
      {value: 35, valueDisplay: "35m", user: this.userA, chart: this.chart2,
       rank: 2});
    this.recordB2 = createModelInstance(this.server, 'record',
      {value: 30, valueDisplay: "30m", user: this.userB, chart: this.chart2,
       rank: 1});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set(
      'chartGroup', this.store.findRecord('chart-group', this.chartGroup.id));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test("if no main chart is specified, the first chart is the main chart", async function(assert) {
    await render(
      hbs`{{chart-ranking-group chartGroup=chartGroup}}`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Rank", "Player", "Chart 1", "Chart 2"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected");
  });

  test("specified main chart is respected", async function(assert) {
    // We specify a chart other than the first chart, to ensure it's different
    // from the default.
    this.set('mainChartIdQueryArg', this.chart2.id);

    await render(
      hbs`{{chart-ranking-group
            chartGroup=chartGroup
            mainChartIdQueryArg=mainChartIdQueryArg}}`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Rank", "Player", "Chart 2", "Chart 1"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected");
  });

  test("records table has one column per chart, and shows the main chart first", async function(assert) {
    this.set('mainChartIdQueryArg', this.chart1.id);

    await render(
      hbs`{{chart-ranking-group
            chartGroup=chartGroup
            mainChartIdQueryArg=mainChartIdQueryArg}}`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Rank", "Player", "Chart 1", "Chart 2"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected");
  });

  test("records table has one row per player, with expected values", async function(assert) {
    this.set('mainChartIdQueryArg', this.chart1.id);

    await render(
      hbs`{{chart-ranking-group
            chartGroup=chartGroup
            mainChartIdQueryArg=mainChartIdQueryArg}}`);

    let rows = this.element.querySelectorAll('table.records-table tr');

    let cells = rows[1].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '1', "User A's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'User A',
      "User A's player display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '20m',
      "User A's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '35m',
      "User A's Chart 2 value is as expected");

    cells = rows[2].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '2', "User B's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'User B',
      "User B's player display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '25m',
      "User B's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '30m',
      "User B's Chart 2 value is as expected");
  });

  test("records table can have a blank cell when a player has no record for a non-main chart", async function(assert) {
    this.set('mainChartIdQueryArg', this.chart1.id);

    this.userC = createModelInstance(this.server, 'user', {username: 'User C'});
    this.recordC1 = createModelInstance(this.server, 'record',
      {value: 27, valueDisplay: "0:27", user: this.userC, chart: this.chart1,
       rank: 3});
    await render(
      hbs`{{chart-ranking-group
            chartGroup=chartGroup
            mainChartIdQueryArg=mainChartIdQueryArg}}`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    let cells = rows[3].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '3', "User C's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'User C',
      "User C's player display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '27m',
      "User C's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '',
      "User C's Chart 2 value is as expected");
  });

  test("records table doesn't show a player who is in the non-main chart, but not in the main chart", async function(assert) {
    this.set('mainChartIdQueryArg', this.chart1.id);

    this.userC = createModelInstance(this.server, 'user', {username: 'User C'});
    this.recordC2 = createModelInstance(this.server, 'record',
      {value: 27, valueDisplay: "27m", user: this.userC, chart: this.chart2,
       rank: 1});
    await render(
      hbs`{{chart-ranking-group
            chartGroup=chartGroup
            mainChartIdQueryArg=mainChartIdQueryArg}}`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    assert.equal(rows.length, 3, "No row added for User C");
  });
});
