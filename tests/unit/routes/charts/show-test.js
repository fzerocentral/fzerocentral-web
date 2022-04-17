import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { click, currentURL, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { getURLSearchParamsHash }
  from 'fzerocentral-web/tests/helpers/route-helpers';


function getFilterGroupSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[0];
}

function getCompareMethodSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[1];
}

function getFilterSelect(testModule) {
  return testModule.element.querySelectorAll(`.ember-power-select-trigger`)[2];
}


module('Unit | Route | charts/show', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    let player1 = createModelInstance(this.server, 'player', {username: "Player 1"});
    let player2 = createModelInstance(this.server, 'player', {username: "Player 2"});
    let game = createModelInstance(this.server, 'game', {name: "Game 1"});
    let chartGroup = createModelInstance(
      this.server, 'chart-group',
      {name: "Group 1", game: game, showChartsTogether: true});
    let chartType = createModelInstance(
      this.server, 'chart-type',
      {name: "Type 1", format_spec: '[{"suffix": "m"}]',
      order_ascending: true, game: game});
    this.chart = createModelInstance(
      this.server, 'chart',
      {name: "Chart 1", chartType: chartType, chartGroup: chartGroup});

    this.machineFG = createModelInstance(
      this.server, 'filter-group',
      {name: 'Machine', kind: 'select', showByDefault: true,
       game: game, orderInGame: 1});
    this.blueFalconFilter = createModelInstance(
      this.server, 'filter',
      {name: 'Blue Falcon', filterGroup: this.machineFG});

    createModelInstance(this.server, 'record',
      {value: 20, valueDisplay: "20m", player: player1, chart: this.chart,
       rank: 1, filters: [this.blueFalconFilter]});
    createModelInstance(this.server, 'record',
      {value: 25, valueDisplay: "25m", player: player2, chart: this.chart,
       rank: 2, filters: []});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test("it exists", function(assert) {
    let route = this.owner.lookup('route:charts/show');
    assert.ok(route, "Route exists");
  });

  test("can be visited", async function(assert){
    await visit(`/charts/${this.chart.id}`);
    assert.equal(currentURL(), `/charts/${this.chart.id}`, "URL is correct");
  });

  test("should make the expected API request for the ranking", async function(assert){
    let apiPath = `/charts/${this.chart.id}/ranking/`;
    let apiExpectedParams = {
      'page[size]': 1000,
    }

    // Mock window.fetch(), setting a flag when the API is
    // called with the expected URL and params.
    let called = false;
    fetchMock.get(
      {url: 'path:' + apiPath, query: apiExpectedParams},
      () => {called = true; return {data: []};},
    );

    await visit(`/charts/${this.chart.id}`);

    assert.ok(
      called, "API call should have been made with expected URL and params");
  });

  test("makes the expected API request for filter groups", async function(assert){
    await visit(`/charts/${this.chart.id}`);

    let filterGroupsRequest =
      this.server.pretender.handledRequests.find((request) => {
        return (
          request.url.startsWith('/filter_groups/?')
          && request.method === 'GET');
      });
    assert.ok(filterGroupsRequest, "Filter groups API call was made");

    let actualParams = getURLSearchParamsHash(filterGroupsRequest.url);
    let expectedParams = {
      chart_id: this.chart.id,
    };
    assert.deepEqual(actualParams, expectedParams, "Params were as expected");
  });

  test("URL params change when filter is added or removed", async function(assert){
    await visit(`/charts/${this.chart.id}`);

    let filterGroupSelect = getFilterGroupSelect(this);
    let compareMethodSelect = getCompareMethodSelect(this);
    let filterSelect = getFilterSelect(this);

    await selectChoose(filterGroupSelect, 'Machine');
    await selectChoose(compareMethodSelect, 'is');
    await selectChoose(filterSelect, 'Blue Falcon');
    await click(`button.add-filter-button`);

    assert.equal(currentURL(),
      `/charts/${this.chart.id}?filters=${this.blueFalconFilter.id}`,
      "URL changed as expected after filter addition");

    let removeButtons =
      this.element.querySelectorAll('button.applied-filter-remove-button');
    await click(removeButtons[0]);

    assert.equal(currentURL(), `/charts/${this.chart.id}`,
      "URL changed as expected after filter removal");
  });
});
