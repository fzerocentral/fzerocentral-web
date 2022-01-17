import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';

module('Integration | Component | chart-ranking-single', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.playerA = createModelInstance(this.server, 'player', {username: 'Player A'});
    this.playerB = createModelInstance(this.server, 'player', {username: 'Player B'});
    this.game = createModelInstance(this.server, 'game', {name: 'Game 1'});
    this.chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: 'Group 1', game: this.game, show_charts_together: true});
    this.chartType = createModelInstance(
      this.server, 'chart-type',
      {name: 'Type 1', format_spec: '[{"suffix": "m"}]',
       order_ascending: true, game: this.game});
    this.chart = createModelInstance(this.server, 'chart',
      {name: 'Chart 1', chartType: this.chartType,
       chartGroup: this.chartGroup});

    this.machineFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Machine', kind: 'select', showByDefault: true});
    this.settingFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Setting', kind: 'numeric', showByDefault: false});

    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType, filterGroup: this.machineFG});
    createModelInstance(
      this.server, 'chart-type-filter-group',
      {chartType: this.chartType, filterGroup: this.settingFG});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('chart', this.chart);
    this.set('records', [
      {rank: 1, player_username: "Player A",
       player_id: this.playerA.id, value_display: "20m",
       filters: [
         {name: "Blue Falcon", filter_group_id: this.machineFG.id},
         {name: "30%", filter_group_id: this.settingFG.id},
       ]},
      {rank: 2, player_username: "Player B",
       player_id: this.playerB.id, value_display: "25m",
       filters: []},
    ]);
    this.set('filterGroups', this.store.query(
        'filterGroup', {chart_type_id: this.chartType.id}));
    this.set('appliedFiltersString', null);
    this.set(
      'updateAppliedFiltersString',
      (s) => this.set('appliedFiltersString', s));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test("records table has one column per shown filter group", async function(assert) {
    await render(
      hbs`<ChartRankingSingle
            @chart={{chart}} @records={{records}}
            @filterGroups={{filterGroups}}
            @appliedFiltersString={{appliedFiltersString}}
            @updateAppliedFiltersString={{updateAppliedFiltersString}} />`);

    let firstRow = this.element.querySelectorAll('table.records-table tr')[0];
    let tableColumnHeaders =
      Array.from(firstRow.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    let expectedTableHeaders = [
      "Rank", "Player", "Record", "Machine"];
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
      "Rank", "Player", "Record", "Machine", "Setting"];
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
      "Rank", "Player", "Record", "Machine"];
    assert.deepEqual(
      tableColumnHeaders, expectedTableHeaders,
      "Column headers are as expected with only default filter groups shown");
  });

  test("records table has one row per record, with expected values", async function(assert) {
    // Without setupRouter(), LinkTo nodes won't have an href attribute
    // in tests. https://stackoverflow.com/questions/32130798/
    this.owner.lookup('router:main').setupRouter();

    await render(
      hbs`<ChartRankingSingle
            @chart={{chart}} @records={{records}}
            @filterGroups={{filterGroups}}
            @appliedFiltersString={{appliedFiltersString}}
            @updateAppliedFiltersString={{updateAppliedFiltersString}} />`);

    let rows = this.element.querySelectorAll('table.records-table tr');
    let cells = rows[1].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '1', "Record A's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'Player A',
      "Record A's player is as expected");
    assert.equal(
      cells[2].textContent.trim(), '20m',
      "Record A's value display is as expected");
    assert.equal(
      cells[2].querySelector('a').getAttribute('href'),
      `/charts/${this.chart.id}/players/${this.playerA.id}/history`,
      "Record A's player-history link is as expected");
    assert.equal(
      cells[3].textContent.trim(), 'Blue Falcon',
      "Record A's machine filter is as expected");
    assert.equal(
      cells.length, 4,
      "Only 4 columns when only showing default filter groups");

    await click('input[name="showAllFilterGroups"]');
    rows = this.element.querySelectorAll('table.records-table tr');
    cells = rows[1].querySelectorAll('td');
    assert.equal(
      cells[4].textContent.trim(), '30%',
      "Record A's setting filter is as expected");

    cells = rows[2].querySelectorAll('td');
    assert.equal(
      cells[0].textContent.trim(), '2', "Record B's rank is as expected");
    assert.equal(
      cells[1].textContent.trim(), 'Player B',
      "Record B's player is as expected");
    assert.equal(
      cells[2].textContent.trim(), '25m',
      "Record B's value display is as expected");
    assert.equal(
      cells[2].querySelector('a').getAttribute('href'),
      `/charts/${this.chart.id}/players/${this.playerB.id}/history`,
      "Record B's player-history link is as expected");
    assert.equal(
      cells[3].textContent.trim(), '',
      "Record B's machine filter is as expected");
    assert.equal(
      cells[4].textContent.trim(), '',
      "Record B's setting filter is as expected");
  });
});
