import { module, test } from 'qunit';
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

  test('can be created', async function(assert){
    let store = this.owner.lookup('service:store');

    let user = server.create('user', {username: 'User A'});
    let game = server.create('game', {name: 'Game 1'});
    let chartGroup = server.create('chart-group', {name: 'Group 1', game: game, show_charts_together: true});
    let chartType = server.create('chart-type', {name: 'Type 1', format_spec: '[{}]', order_ascending: true, game: game});
    let chart = server.create('chart', {name: 'Chart 1', chartType: chartType, chartGroup: chartGroup});

    await visit(`/charts/${chart.id}/record-new`);

    // In this selectChoose CSS selector, we're banking on the user dropdown
    // being the only power-select widget on the page...
    // This also seems to be how ember-power-select's tests do it:
    // https://github.com/cibernox/ember-power-select/blob/14b5b6794c0230a3d68650ee845a0f49af63d1c7/tests/integration/components/power-select/helpers-test.js
    await selectChoose('.ember-power-select-trigger', 'User A');
    fillIn('.value-input', '123');
    await click('button[type=submit]');

    // Should redirect to the chart's page
    assert.equal(currentURL(), `/charts/${chart.id}`);

    // Check that the record was indeed saved to the API database
    // with the expected values.
    // The date was just the date of submission, and we don't know exactly
    // what that was, so we'll just check that it is a Date.
    let records = run(() => store.findAll('record'));
    let record = records.objectAt(0);
    assert.equal(record.get('chart').get('id'), chart.id);
    assert.equal(record.get('user').get('id'), user.id);
    assert.equal(record.get('value'), 123);
    assert.equal(record.get('achievedAt').constructor.name, 'Date');
  });
});
