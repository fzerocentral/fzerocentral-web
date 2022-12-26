import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { click, currentURL, fillIn, select, visit } from '@ember/test-helpers';
import { createModelInstance } from '../../../utils/models';

function createFilter(server, name, group, type = 'choosable', value = null) {
  return createModelInstance(server, 'filter', {
    name: name,
    filterGroup: group,
    usageType: type,
    numericValue: value,
  });
}

module('Unit | Route | charts/record-new', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.player = createModelInstance(this.server, 'player', {
      username: 'Player A',
    });
    let game = createModelInstance(this.server, 'game', { name: 'Game 1' });

    this.machineFG = createModelInstance(this.server, 'filter-group', {
      name: 'Machine',
      kind: 'select',
      showByDefault: true,
      game: game,
      orderInGame: 1,
    });
    this.blueFalconFilter = createFilter(
      this.server,
      'Blue Falcon',
      this.machineFG,
      'choosable'
    );
    this.settingFG = createModelInstance(this.server, 'filter-group', {
      name: 'Setting',
      kind: 'numeric',
      showByDefault: true,
      game: game,
      orderInGame: 2,
    });
    this.setting80Filter = createFilter(
      this.server,
      '80%',
      this.settingFG,
      'choosable',
      80
    );

    let chartGroup = createModelInstance(this.server, 'chart-group', {
      name: 'Group 1',
      game: game,
      showChartsTogether: true,
    });
    let chartType = createModelInstance(this.server, 'chart-type', {
      name: 'Type 1',
      formatSpec: '[{"suffix": "m"}]',
      orderAscending: true,
      game: game,
      filterGroups: [this.machineFG, this.settingFG],
    });
    this.chart = createModelInstance(this.server, 'chart', {
      name: 'Chart 1',
      chartType: chartType,
      chartGroup: chartGroup,
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:charts/record-new');
    assert.ok(route, 'Route should exist');
  });

  test('can be visited', async function (assert) {
    await visit(`/charts/${this.chart.id}/record-new`);
    assert.strictEqual(
      currentURL(),
      `/charts/${this.chart.id}/record-new`,
      'URL should be correct'
    );
  });

  // Skip: the redirect to charts/show after submission doesn't work yet.
  // charts/show needs a ladder id. So, this route in turn needs to be
  // reworked to accept a ladder id, so that can be passed to charts/show.
  test.skip('can create new record', async function (assert) {
    await visit(`/charts/${this.chart.id}/record-new`);

    // Fill fields.
    await select('#player-select', this.player.id);
    fillIn('#value-field', '123');
    await select(
      `#filter-${this.machineFG.id}-select`,
      this.blueFalconFilter.id
    );
    await select(
      `#filter-${this.settingFG.id}-select`,
      this.setting80Filter.id
    );
    // Submit form.
    await click('button.submit');

    assert.strictEqual(
      currentURL(),
      `/charts/${this.chart.id}`,
      'Should redirect to chart page'
    );

    // Check that the record was indeed saved to the API database
    // with the expected values.
    let records = run(() => this.store.findAll('record'));
    let record = records.objectAt(0);

    assert.strictEqual(
      record.get('chart').get('id'),
      this.chart.id,
      'Chart should be as expected'
    );
    assert.strictEqual(
      record.get('player').get('id'),
      this.player.id,
      'Player should be as expected'
    );
    assert.strictEqual(record.get('value'), 123, 'Value should be as expected');

    // The date was just the date of submission, and we don't know exactly
    // what that was, so we'll just check that it is a Date.
    assert.strictEqual(
      record.get('dateAchieved').constructor.name,
      'Date',
      'Date should be as expected'
    );

    // Compare filters. We're agnostic to filter order here.
    let filterIds = new Set();
    record.get('filters').forEach(function (filter) {
      filterIds.add(filter.id);
    });
    assert.deepEqual(
      filterIds,
      new Set([this.blueFalconFilter.id, this.setting80Filter.id]),
      'Filters should be as expected'
    );
  });
});
