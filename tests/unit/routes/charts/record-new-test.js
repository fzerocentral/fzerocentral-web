import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


function createFilter(server, name, group, type='choosable', value=null) {
  return createModelInstance(
    server, 'filter',
    {name: name, filterGroup: group, usageType: type, numericValue: value});
}


module('Unit | Route | charts/record-new', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.player = createModelInstance(this.server, 'player', {username: "Player A"});
    let game = createModelInstance(this.server, 'game', {name: "Game 1"});

    this.machineFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Machine', kind: 'select', showByDefault: true,
       game: game, orderInGame: 1});
    this.blueFalconFilter = createFilter(
      this.server, "Blue Falcon", this.machineFG, 'choosable');
    this.settingFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Setting', kind: 'numeric', showByDefault: true,
       game: game, orderInGame: 2});
    this.setting80Filter = createFilter(
      this.server, "80%", this.settingFG, 'choosable', 80);

    let chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: "Group 1", game: game, showChartsTogether: true});
    let chartType = createModelInstance(
      this.server, 'chart-type',
      {name: "Type 1", formatSpec: '[{"suffix": "m"}]',
       orderAscending: true, game: game,
       filterGroups: [this.machineFG, this.settingFG]});
    this.chart = createModelInstance(
      this.server, 'chart',
      {name: "Chart 1", chartType: chartType, chartGroup: chartGroup});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/record-new');
    assert.ok(route, "Route exists");
  });

  test('can be visited', async function(assert){
    await visit(`/charts/${this.chart.id}/record-new`);
    assert.equal(currentURL(), `/charts/${this.chart.id}/record-new`,
      "URL is correct");
  });

  test('can create new record', async function(assert){
    await visit(`/charts/${this.chart.id}/record-new`);

    // Fill fields.
    await selectChoose('div.player-select > .ember-power-select-trigger', 'Player A');
    fillIn('.value-input', '123');
    await selectChoose(`div.filter-group-${this.machineFG.id}-select .ember-power-select-trigger`, 'Blue Falcon');
    await selectChoose(`div.filter-group-${this.settingFG.id}-select .ember-power-select-trigger`, '80%');
    // Submit form.
    await click('button[type=submit]');

    // Should redirect to the chart's page
    assert.equal(
      currentURL(), `/charts/${this.chart.id}`,
      "Redirected after new record submission");

    // Check that the record was indeed saved to the API database
    // with the expected values.
    let records = run(() => this.store.findAll('record'));
    let record = records.objectAt(0);

    assert.equal(
      record.get('chart').get('id'), this.chart.id, "Chart is as expected");
    assert.equal(
      record.get('player').get('id'), this.player.id, "Player is as expected");
    assert.equal(record.get('value'), 123, "Value is as expected");

    // The date was just the date of submission, and we don't know exactly
    // what that was, so we'll just check that it is a Date.
    assert.equal(
      record.get('dateAchieved').constructor.name, 'Date',
      "Date is as expected");

    // Compare filters. We're agnostic to filter order here.
    let filterIds = new Set();
    record.get('filters').forEach(function(filter) {
      filterIds.add(filter.id);
    });
    assert.deepEqual(
      filterIds, new Set([this.blueFalconFilter.id, this.setting80Filter.id]),
      "Filters are as expected");
  });
});
