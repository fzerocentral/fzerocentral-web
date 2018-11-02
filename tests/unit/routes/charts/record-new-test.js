import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from "@ember/runloop";
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';

module('Unit | Route | charts/record-new', function(hooks) {
  hooks.beforeEach( function() {
    this.server = startMirage();
  });
  hooks.afterEach( function() {
    this.server.shutdown();
  });
  setupRenderingTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/record-new');
    assert.ok(route);
  });

  test('can be visited', async function(assert){
    let game = server.create('game', {name: 'Game 1'});
    let chartGroup = server.create('chart-group', {name: 'Group 1', game: game, show_charts_together: true});
    let chartType = server.create('chart-type', {name: 'Type 1', format_spec: '[{}]', order_ascending: true, game: game});
    let chart = server.create('chart', {name: 'Chart 1', chartType: chartType, chartGroup: chartGroup});

    await visit(`/charts/${chart.id}/record-new`);
    assert.equal(currentURL(), `/charts/${chart.id}/record-new`);
  });

  // TODO: The redirect to charts/show doesn't work, says filterGroups is
  // undefined. What's going on?
  skip('can be created', async function(assert){
    let store = this.owner.lookup('service:store');

    let user = server.create('user', {username: 'User A'});
    let game = server.create('game', {name: 'Game 1'});
    let chartGroup = server.create('chart-group', {name: 'CGroup 1', game: game, show_charts_together: true});
    let chartType = server.create('chart-type', {name: 'Type 1', format_spec: '[{}]', order_ascending: true, game: game});
    let chart = server.create('chart', {name: 'Chart 1', chartType: chartType, chartGroup: chartGroup});

    let filterGroupA = server.create('filterGroup', {name: 'FGroup A'});
    let filterA1 = server.create('filter', {name: 'Filter A1', filterGroup: filterGroupA});
    server.create('filter', {name: 'Filter A2', filterGroup: filterGroupA});
    let filterGroupB = server.create('filterGroup', {name: 'FGroup B'});
    server.create('filter', {name: 'Filter B1', filterGroup: filterGroupB});
    let filterB2 = server.create('filter', {name: 'Filter B2', filterGroup: filterGroupB});

    await visit(`/charts/${chart.id}/record-new`);

    // Fill fields.
    await selectChoose('div.user-select > .ember-power-select-trigger', 'User A');
    fillIn('.value-input', '123');
    await selectChoose(`div.filter-group-${filterGroupA.id}-select .ember-power-select-trigger`, 'Filter A1');
    await selectChoose(`div.filter-group-${filterGroupB.id}-select .ember-power-select-trigger`, 'Filter B2');

    await click('button[type=submit]');

    // Should redirect to the chart's page
    assert.equal(currentURL(), `/charts/${chart.id}`);

    // Check that the record was indeed saved to the API database
    // with the expected values.
    let records = run(() => store.findAll('record'));
    let record = records.objectAt(0);

    assert.equal(record.get('chart').get('id'), chart.id);
    assert.equal(record.get('user').get('id'), user.id);
    assert.equal(record.get('value'), 123);

    // The date was just the date of submission, and we don't know exactly
    // what that was, so we'll just check that it is a Date.
    assert.equal(record.get('achievedAt').constructor.name, 'Date');

    // Compare filters. We're agnostic to filter order here.
    let filterIds = [];
    record.get('filters').forEach(function(filter) {
      filterIds.push(filter.id);
    });
    assert.deepEqual(filterIds.sort(), [filterA1.id, filterB2.id].sort());
  });
});
