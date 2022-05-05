import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from '../../../utils/models';
import { getURLSearchParamsHash } from '../../../utils/routes';

function collapseWhitespace(text) {
  // Collapse consecutive whitespace characters into a single space. Trim
  // leading/trailing spaces from the result.
  return text.replace(/\s+/g, ' ').trim();
}

function assertHTMLEqual(assert, element, expectedHTML, message) {
  let basicElement = element.cloneNode(true);
  // Remove ember-generated ids and classes from all anchor elements.
  basicElement.querySelectorAll('a').forEach((anchorElement) => {
    // Remove any ember-generated id.
    if (anchorElement.id.startsWith('ember')) {
      anchorElement.removeAttribute('id');
    }
    // Remove any ember-generated CSS classes.
    for (let cssClass of Array.from(anchorElement.classList)) {
      if (cssClass.startsWith('ember')) {
        anchorElement.classList.remove(cssClass);
      }
    }
    // If there are no CSS classes left, remove the class attribute.
    if (anchorElement.classList.length === 0) {
      anchorElement.removeAttribute('class');
    }
  });

  let elementHTML = collapseWhitespace(basicElement.innerHTML);
  expectedHTML = collapseWhitespace(expectedHTML);
  assert.equal(elementHTML, expectedHTML, message);
}

function assertTableContents(assert, tableElement, expectedContents) {
  let rowElements = tableElement.querySelectorAll('tr');

  for (let [rowIndex, rowElement] of Array.from(rowElements).entries()) {
    let expectedRow = expectedContents[rowIndex];
    let cellElements = rowElement.children;

    for (let [colIndex, cellElement] of Array.from(cellElements).entries()) {
      assertHTMLEqual(
        assert,
        cellElement,
        expectedRow[colIndex],
        `Content of Row ${rowIndex}, Col ${colIndex} should be as expected`
      );
    }

    assert.equal(
      cellElements.length,
      expectedRow.length,
      `Row ${rowIndex} should have the expected number of cells`
    );
  }

  assert.equal(
    rowElements.length,
    expectedContents.length,
    `Table should have the expected number of rows`
  );
}

module('Unit | Route | games/filter-groups', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    this.otherGame = createModelInstance(this.server, 'game', {
      name: 'Other',
    });
    this.chartType1 = createModelInstance(this.server, 'chart-type', {
      name: 'Type 1',
      format_spec: '[{"suffix": "m"}]',
      order_ascending: true,
      game: this.game,
    });
    this.chartType2 = createModelInstance(this.server, 'chart-type', {
      name: 'Type 2',
      format_spec: '[{"suffix": "pts"}]',
      order_ascending: true,
      game: this.game,
    });
    this.otherChartType = createModelInstance(this.server, 'chart-type', {
      name: 'Other Type',
      format_spec: '[{"suffix": "km"}]',
      order_ascending: true,
      game: this.otherGame,
    });

    this.filterGroupA = createModelInstance(this.server, 'filter-group', {
      name: 'Group A',
      kind: 'select',
      showByDefault: true,
      game: this.game,
      orderInGame: 1,
    });
    this.filterGroupB = createModelInstance(this.server, 'filter-group', {
      name: 'Group B',
      kind: 'select',
      showByDefault: true,
      game: this.game,
      orderInGame: 2,
    });
    this.filterGroupC = createModelInstance(this.server, 'filter-group', {
      name: 'Group C',
      kind: 'select',
      showByDefault: false,
      // Different game
      game: this.otherGame,
      orderInGame: 3,
    });
    this.filterGroupD = createModelInstance(this.server, 'filter-group', {
      name: 'Group D',
      kind: 'select',
      showByDefault: false,
      game: this.game,
      orderInGame: 4,
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/filter-groups');
    assert.ok(route, 'Route exists');
  });

  test('can be visited', async function (assert) {
    await visit(`/games/${this.game.id}/filter-groups`);
    assert.equal(
      currentURL(),
      `/games/${this.game.id}/filter-groups`,
      'URL is correct'
    );
  });

  test('should make the expected API request for filter groups', async function (assert) {
    await visit(`/games/${this.game.id}/filter-groups`);

    let gameFGsRequest = this.server.pretender.handledRequests.find(
      (request) => {
        let params = getURLSearchParamsHash(request.url);
        return (
          request.url.startsWith('/filter_groups/?') &&
          Object.prototype.hasOwnProperty.call(params, 'game_id') &&
          request.method === 'GET'
        );
      }
    );
    assert.ok(
      gameFGsRequest,
      'API call was made for filter groups in this game'
    );
    let actualParams = getURLSearchParamsHash(gameFGsRequest.url);
    let expectedParams = {
      game_id: this.game.id,
    };
    assert.deepEqual(
      actualParams,
      expectedParams,
      'Call params were as expected'
    );
  });

  test('should have the correct filter group details', async function (assert) {
    assert.expect(5 * 4 + 1);

    await visit(`/games/${this.game.id}/filter-groups`);

    assertTableContents(
      assert,
      this.element.querySelector('table.filter-groups'),
      [
        ['Name', 'Kind', 'Show by default on rankings?', 'Description'],
        [
          `<a href="/filter-groups/${this.filterGroupA.id}"> Group A </a>`,
          'select',
          'true',
          '',
        ],
        [
          `<a href="/filter-groups/${this.filterGroupB.id}"> Group B </a>`,
          'select',
          'true',
          '',
        ],
        [
          `<a href="/filter-groups/${this.filterGroupD.id}"> Group D </a>`,
          'select',
          'false',
          '',
        ],
      ]
    );
  });
});
