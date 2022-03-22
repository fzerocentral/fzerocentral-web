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

    this.game = createModelInstance(this.server, 'game', {name: 'Game 1'});
    this.chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: 'Group 1', game: this.game, showChartsTogether: true});
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
      hbs`<ChartRankingGroup @chartGroup={{chartGroup}} />`);

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
      hbs`<ChartRankingGroup
            @chartGroup={{chartGroup}}
            @mainChartIdQueryArg={{mainChartIdQueryArg}} />`);

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
      hbs`<ChartRankingGroup
            @chartGroup={{chartGroup}}
            @mainChartIdQueryArg={{mainChartIdQueryArg}} />`);

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
    this.set('recordRows', [
      {
        main_record: {
          rank: 1, player_username: "Player A", value_display: "20m"},
        other_records: [{value_display: "35m"}],
      },
      {
        main_record: {
          rank: 2, player_username: "Player B", value_display: "25m"},
        other_records: [{value_display: "30m"}],
      },
    ]);

    await render(
      hbs`<ChartRankingGroup
            @chartGroup={{chartGroup}}
            @mainChartIdQueryArg={{mainChartIdQueryArg}}
            @recordRows={{recordRows}} />`);

    let rows = this.element.querySelectorAll('table.records-table tr');

    let cells = rows[1].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '1', "Player A's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'Player A',
      "Player A's username display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '20m',
      "Player A's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '35m',
      "Player A's Chart 2 value is as expected");

    cells = rows[2].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '2', "Player B's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'Player B',
      "Player B's username display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '25m',
      "Player B's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '30m',
      "Player B's Chart 2 value is as expected");
  });

  test("records table can have a blank cell when a player has no record for a non-main chart", async function(assert) {
    this.set('mainChartIdQueryArg', this.chart1.id);
    this.set('recordRows', [
      {
        main_record: {
          rank: 1, player_username: "Player A", value_display: "20m"},
        other_records: [{value_display: "35m"}],
      },
      {
        main_record: {
          rank: 2, player_username: "Player B", value_display: "25m"},
        other_records: [null],
      },
    ]);

    await render(
      hbs`<ChartRankingGroup
            @chartGroup={{chartGroup}}
            @mainChartIdQueryArg={{mainChartIdQueryArg}}
            @recordRows={{recordRows}} />`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    let cells = rows[2].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '2', "Player B's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'Player B',
      "Player B's username display is as expected");
    assert.equal(
      cells[2].textContent.trim(), '25m',
      "Player B's Chart 1 value is as expected");
    assert.equal(
      cells[3].textContent.trim(), '',
      "Player B's Chart 2 value is as expected");
  });
});
