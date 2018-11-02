import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';

module('Unit | Route | charts/show', function(hooks) {
  setupTest(hooks);
  hooks.beforeEach( function() {
    this.server = startMirage();
  });
  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/show');
    assert.ok(route);
  });

  test('can be visited', async function(assert){
    let user1 = server.create('user', {username: "User 1"});
    let user2 = server.create('user', {username: "User 2"});
    let game = server.create('game', {name: "Game 1"});
    let chartGroup = server.create('chart-group', {name: "Group 1", game: game, show_charts_together: true});
    let chartType = server.create('chart-type', {name: "Type 1", format_spec: '[{}]', order_ascending: true, game: game});
    let chart = server.create('chart', {name: "Chart 1", chartType: chartType, chartGroup: chartGroup});
    server.create('record', {chart: chart, value: 10, user: user1});
    server.create('record', {chart: chart, value: 12, user: user2});

    await visit(`/charts/${chart.id}`);
    assert.equal(currentURL(), `/charts/${chart.id}`);
  });
});
