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

    this.game = createModelInstance(this.server, 'game', {
      name: 'Game 1',
      shortCode: 'g1',
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
    await visit(`/games/${this.game.shortCode}/filter-groups`);
    assert.equal(
      currentURL(),
      `/games/${this.game.shortCode}/filter-groups`,
      'URL is correct'
    );
  });

  // Skip: trackRequests option doesn't seem to work anymore, getting the error
  // `You cannot modify Pretender's request tracking once the server is created`
  // if it's set to true. Should assert the request some other way, perhaps by
  // rewriting the handler with `this.server.get(...)` and using assert within
  // that rewritten handler.
  test.skip('should make the expected API request for filter groups', async function (assert) {
    await visit(`/games/${this.game.shortCode}/filter-groups`);

    let gameFGsRequest = this.server.pretender.handledRequests.find(
      (request) => {
        let params = getURLSearchParamsHash(request.url);
        return (
          request.url.startsWith('/filter_groups/?') &&
          Object.prototype.hasOwnProperty.call(params, 'game_code') &&
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
      game_code: this.game.shortCode,
    };
    assert.deepEqual(
      actualParams,
      expectedParams,
      'Call params were as expected'
    );
  });

  test('should have the correct filter group details', async function (assert) {
    assert.expect(4 * 4 + 1);

    this.server.pretender.get('/filter_groups/', (request) => {
      assert.deepEqual(
        request.queryParams,
        { game_code: this.game.shortCode },
        'Filter groups endpoint should be called with expected params'
      );
      let body = {
        data: [
          {
            type: 'filter-groups',
            id: '1',
            attributes: {
              name: 'Group A',
              kind: 'select',
              'show-by-default': true,
              'order-in-game': 1,
            },
          },
          {
            type: 'filter-groups',
            id: '2',
            attributes: {
              name: 'Group B',
              kind: 'select',
              'show-by-default': false,
              'order-in-game': 2,
            },
          },
        ],
      };
      return [200, {}, JSON.stringify(body)];
    });

    await visit(`/games/${this.game.shortCode}/filter-groups`);

    assertTableContents(
      assert,
      this.element.querySelector('table.filter-groups'),
      [
        ['Name', 'Kind', 'Show by default on rankings?', 'Description'],
        [`<a href="/filter-groups/1"> Group A </a>`, 'select', 'true', ''],
        [`<a href="/filter-groups/2"> Group B </a>`, 'select', 'false', ''],
      ]
    );
  });
});
