import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';

module('Unit | Route | charts/record-new', function(hooks) {
  setupRenderingTest(hooks);

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
      {name: "Type 1", format_spec: '[{"suffix": "m"}]',
      order_ascending: true, game: game});
    this.chart = createModelInstance(
      this.server, 'chart',
      {name: "Chart 1", chartType: chartType, chartGroup: chartGroup});

    this.machineFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Machine', kind: 'select', showByDefault: true});
    this.blueFalconFilter = createModelInstance(
      this.server, 'filter',
      {name: 'Blue Falcon', filterGroup: this.machineFG});
    this.settingFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Setting', kind: 'numeric', showByDefault: false});
    this.setting80Filter = createModelInstance(
      this.server, 'filter',
      {name: '80%', numericValue: 80, filterGroup: this.settingFG});

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
    await selectChoose('div.user-select > .ember-power-select-trigger', 'User A');
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
      record.get('user').get('id'), this.user.id, "User is as expected");
    assert.equal(record.get('value'), 123, "Value is as expected");

    // The date was just the date of submission, and we don't know exactly
    // what that was, so we'll just check that it is a Date.
    assert.equal(
      record.get('achievedAt').constructor.name, 'Date',
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
