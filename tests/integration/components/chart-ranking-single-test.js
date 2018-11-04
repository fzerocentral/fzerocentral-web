import { module, test } from 'qunit';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | chart-ranking-single', function(hooks) {
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
    let chart = server.create('chart', {name: 'Chart 1', chartType: chartType, chartGroup: chartGroup});
    server.create('record', {value: 20, user: userA, chart: chart});
    server.create('record', {value: 25, user: userB, chart: chart});

    this.set('chart', chart);
    this.set('filterGroups', A([]));
    this.set('records', run(() => store.query('record', {
      chart_id: chart.id, sort: 'value', ranked_entity: 'user'})));
    this.set('appliedFiltersString', null);
    await render(hbs`{{chart-ranking-single chart=chart filterGroups=filterGroups records=records appliedFiltersString=appliedFiltersString}}`);

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
      "Show all filter groups", "Filters:",
      "Rank", "Player", "Record",
      "1", "User A", "20",
      "2", "User B", "25"]);
  });
});
