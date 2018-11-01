import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from "@ember/runloop";
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | chart-ranking-group', function(hooks) {
  hooks.beforeEach( function() {
    this.server = startMirage();
  });
  hooks.afterEach( function() {
    this.server.shutdown();
  });
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    let store = this.owner.lookup('service:store');

    let userA = server.create('user', {username: 'User A'});
    let userB = server.create('user', {username: 'User B'});
    let game = server.create('game', {name: 'Game 1'});
    let chartGroup = server.create('chart-group', {name: 'Group 1', game: game, show_charts_together: true});
    let chartType = server.create('chart-type', {name: 'Type 1', format_spec: '[{}]', order_ascending: true, game: game});
    let chart1 = server.create('chart', {name: 'Chart 1', chartType: chartType, chartGroup: chartGroup});
    let chart2 = server.create('chart', {name: 'Chart 2', chartType: chartType, chartGroup: chartGroup});
    server.create('record', {value: 20, user: userA, chart: chart1});
    server.create('record', {value: 25, user: userB, chart: chart1});
    server.create('record', {value: 35, user: userA, chart: chart2});
    server.create('record', {value: 30, user: userB, chart: chart2});

    // Getting from the store, instead of using our local var above, avoids
    // `TypeError: this.mainChart.get is not a function`
    this.set('chartGroup', run(() => store.findRecord('chart-group', chartGroup.id)))
    this.set('mainChart', run(() => store.findRecord('chart', chart1.id)))

    await render(hbs`{{chart-ranking-group chartGroup=chartGroup mainChart=mainChart}}`);

    // textContent has a lot of newlines and extra spaces on either side of
    // them. We'll get rid of those before comparing.
    let textContentLines = [];
    this.element.textContent.split('\n').forEach((rawLine) => {
      let line = rawLine.trim();
      if (line !== '') {
        textContentLines.push(line);
      }
    })
    assert.deepEqual(textContentLines, [
      'Rank', 'Player', 'Chart 1', 'Chart 2',
      '1', 'User A', '20', '35',
      '2', 'User B', '25', '30']);
  });
});
