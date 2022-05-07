import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { click, currentURL, select, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from '../../../utils/models';
import { getURLSearchParamsHash } from '../../../utils/routes';

module('Unit | Route | charts/show', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.router = this.owner.lookup('service:router');
    this.store = this.owner.lookup('service:store');

    let player1 = createModelInstance(this.server, 'player', {
      username: 'Player 1',
    });
    let player2 = createModelInstance(this.server, 'player', {
      username: 'Player 2',
    });
    let game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    let chartGroup = createModelInstance(this.server, 'chart-group', {
      name: 'Group 1',
      game: game,
      showChartsTogether: true,
    });
    let chartType = createModelInstance(this.server, 'chart-type', {
      name: 'Type 1',
      format_spec: '[{"suffix": "m"}]',
      order_ascending: true,
      game: game,
    });
    this.chart = createModelInstance(this.server, 'chart', {
      name: 'Chart 1',
      chartType: chartType,
      chartGroup: chartGroup,
    });

    this.machineFG = createModelInstance(this.server, 'filter-group', {
      name: 'Machine',
      kind: 'select',
      showByDefault: true,
      game: game,
      orderInGame: 1,
    });
    this.blueFalconFilter = createModelInstance(this.server, 'filter', {
      name: 'Blue Falcon',
      filterGroup: this.machineFG,
    });

    this.ladder = createModelInstance(this.server, 'ladder', {
      name: 'Ladder 1',
      game: game,
      filterSpec: '',
    });

    createModelInstance(this.server, 'record', {
      value: 20,
      valueDisplay: '20m',
      player: player1,
      chart: this.chart,
      rank: 1,
      filters: [this.blueFalconFilter],
    });
    createModelInstance(this.server, 'record', {
      value: 25,
      valueDisplay: '25m',
      player: player2,
      chart: this.chart,
      rank: 2,
      filters: [],
    });

    this.routeUrl = this.router.urlFor('charts.show', this.chart.id, {
      queryParams: { ladderId: this.ladder.id },
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:charts/show');
    assert.ok(route, 'Route exists');
  });

  // Skip: this seems to intermittently get 'No fallback response defined for GET to /charts/1/other_records'
  test.skip('should make the expected API request for the ranking', async function (assert) {
    let apiExpectedPath = `/charts/${this.chart.id}/ranking/`;
    let apiExpectedParams = {
      'page[size]': 1000,
    };

    // Mock window.fetch(), setting a flag when the API is
    // called with the expected URL and params.
    let called = false;
    fetchMock.get(
      { url: 'path:' + apiExpectedPath, query: apiExpectedParams },
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

  // Skip: this seems to intermittently get 'No fallback response defined for GET to /charts/1/other_records'
  test.skip('should make the expected API request for filter groups', async function (assert) {
    await visit(this.routeUrl);

    let filterGroupsRequest = this.server.pretender.handledRequests.find(
      (request) => {
        return (
          request.url.startsWith('/filter_groups/?') && request.method === 'GET'
        );
      }
    );
    assert.ok(filterGroupsRequest, 'Filter groups API call should be made');

    let actualParams = getURLSearchParamsHash(filterGroupsRequest.url);
    let expectedParams = {
      chart_id: this.chart.id,
    };
    assert.deepEqual(
      actualParams,
      expectedParams,
      'Params should be as expected'
    );
  });

  test('URL params should change when filter is added or removed', async function (assert) {
    // Mock the response of GET filter_groups
    // TODO: This causes `XML Parsing Error: not well-formed` in console, but the test doesn't actually fail.
    this.server.pretender.get('/filter_groups/', (/* request */) => {
      let body = {
        data: [
          {
            type: 'filter-groups',
            id: this.machineFG.id,
            attributes: {
              name: 'Machine',
            },
          },
        ],
      };
      return [200, {}, JSON.stringify(body)];
    });

    await visit(this.routeUrl);

    await click('#show-filter-controls-checkbox');
    await select('select[name="filter-group"]', this.machineFG.id);
    await select('select[name="modifier"]', '');
    await select('select[name="filter-select"]', this.blueFalconFilter.id);
    await click('#filter-apply-form button');

    let expectedUrl = this.router.urlFor('charts.show', this.chart.id, {
      queryParams: {
        ladderId: this.ladder.id,
        filters: this.blueFalconFilter.id,
      },
    });
    assert.equal(
      currentURL(),
      expectedUrl,
      'URL should change as expected after filter addition'
    );

    let removeButtons = this.element.querySelectorAll(
      'button.applied-filter-remove-button'
    );
    await click(removeButtons[0]);

    assert.equal(
      currentURL(),
      this.routeUrl,
      'URL should change as expected after filter removal'
    );
  });
});
