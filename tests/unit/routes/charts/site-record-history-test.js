import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, visit } from '@ember/test-helpers';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | charts/site-record-history', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.router = this.owner.lookup('service:router');
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
    this.settingFG = createModelInstance(this.server, 'filter-group', {
      name: 'Setting',
      kind: 'numeric',
      showByDefault: false,
      game: game,
      orderInGame: 2,
    });

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

    this.ladder = createModelInstance(this.server, 'ladder', {
      name: 'Ladder 1',
      game: game,
    });

    this.apiExpectedPath = `/charts/${this.chart.id}/record_history/`;
    this.apiExpectedParams = {
      improvements: 'filter',
      ladder_id: this.ladder.id,
      'page[size]': '100',
    };
    this.routeUrl = this.router.urlFor(
      'charts.site-record-history',
      this.chart.id,
      {
        queryParams: { ladderId: this.ladder.id },
      }
    );
  });

  hooks.afterEach(function () {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:charts/site-record-history');
    assert.ok(route);
  });

  test('should make the expected API request for records', async function (assert) {
    // Mock window.fetch(), setting a flag when the API is
    // called with the expected URL and params.
    let called = false;
    fetchMock.get(
      { url: 'path:' + this.apiExpectedPath, query: this.apiExpectedParams },
      () => {
        called = true;
        return { data: [] };
      }
    );

    await visit(this.routeUrl);

    assert.ok(
      called,
      'API call should have been made with expected URL and params'
    );
  });

  test('records table should list record details', async function (assert) {
    // Mock window.fetch() to get a particular result from the API call.
    fetchMock.get(
      { url: 'path:' + this.apiExpectedPath, query: this.apiExpectedParams },
      () => {
        return {
          data: [
            {
              value_display: '70m',
              player_username: 'Player B',
              date_achieved: new Date(2003, 0),
              filters: [],
            },
            {
              value_display: '60m',
              player_username: 'Player A',
              date_achieved: new Date(2002, 0),
              filters: [],
            },
          ],
        };
      }
    );

    await visit(this.routeUrl);

    let rows = this.element.querySelectorAll('table.data-table tr');
    let [playerCell, valueCell, dateCell] = rows[1].querySelectorAll('td');
    assert.dom(playerCell).hasText('Player B', 'Player should be as expected');
    assert.dom(valueCell).hasText('70m', 'Value should be as expected');
    assert
      .dom(dateCell)
      .hasText('2003-01-01 00:00', 'Date should be as expected');
    [playerCell, valueCell, dateCell] = rows[2].querySelectorAll('td');
    assert.dom(playerCell).hasText('Player A', 'Player should be as expected');
    assert.dom(valueCell).hasText('60m', 'Value should be as expected');
    assert
      .dom(dateCell)
      .hasText('2002-01-01 00:00', 'Date should be as expected');
  });

  test('records table should have one column per shown filter group', async function (assert) {
    await visit(this.routeUrl);

    let firstRow = this.element.querySelectorAll('table.data-table tr')[0];
    let tableColumnHeaders = Array.from(firstRow.querySelectorAll('th')).map(
      (th) => th.textContent.trim()
    );
    let expectedTableHeaders = ['Player', 'Record', 'Date', 'Machine'];
    assert.deepEqual(
      tableColumnHeaders,
      expectedTableHeaders,
      'Column headers should be as expected with only default filter groups shown'
    );

    // Check
    await click('input[name="show-all-filter-groups"]');

    firstRow = this.element.querySelectorAll('table.data-table tr')[0];
    tableColumnHeaders = Array.from(firstRow.querySelectorAll('th')).map((th) =>
      th.textContent.trim()
    );
    expectedTableHeaders = ['Player', 'Record', 'Date', 'Machine', 'Setting'];
    assert.deepEqual(
      tableColumnHeaders,
      expectedTableHeaders,
      'Column headers should be as expected with all filter groups shown'
    );

    // Uncheck
    await click('input[name="show-all-filter-groups"]');

    firstRow = this.element.querySelectorAll('table.data-table tr')[0];
    tableColumnHeaders = Array.from(firstRow.querySelectorAll('th')).map((th) =>
      th.textContent.trim()
    );
    expectedTableHeaders = ['Player', 'Record', 'Date', 'Machine'];
    assert.deepEqual(
      tableColumnHeaders,
      expectedTableHeaders,
      'Column headers should be as expected with only default filter groups shown'
    );
  });
});
