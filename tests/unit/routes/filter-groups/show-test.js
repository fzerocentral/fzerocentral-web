import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from '../../../utils/models';

function getFiltersListItemByName(rootElement, name, type = 'choosable') {
  let filtersList;
  if (type === 'choosable') {
    filtersList = rootElement.querySelector('div.choosable-filter-list ul');
  } else {
    filtersList = rootElement.querySelector('div.implied-filter-list ul');
  }

  let listItems = filtersList.querySelectorAll('li');

  // Return the first row which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('button').textContent.trim() === name;
  });
}

function createFilter(
  thisObj,
  name,
  usageType,
  { filterGroup = null, numericValue = null } = {}
) {
  createModelInstance(thisObj.server, 'filter', {
    name: name,
    usageType: usageType,
    filterGroup: filterGroup || thisObj.filterGroup,
    numericValue: numericValue,
  });
}

module('Unit | Route | filter-groups/show', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });

    this.filterGroup = createModelInstance(this.server, 'filter-group', {
      name: 'Machine',
      kind: 'select',
      showByDefault: true,
      game: this.game,
      orderInGame: 1,
    });
    this.numericFilterGroup = createModelInstance(this.server, 'filter-group', {
      name: 'Setting',
      kind: 'numeric',
      showByDefault: false,
      game: this.game,
      orderInGame: 2,
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:filter-groups/show');
    assert.ok(route, 'Route exists');
  });

  test('can be visited', async function (assert) {
    await visit(`/filter-groups/${this.filterGroup.id}`);
    assert.equal(
      currentURL(),
      `/filter-groups/${this.filterGroup.id}`,
      'URL is correct'
    );
  });

  test('lists the chart types that use the filter group', async function (assert) {
    assert.expect(2);

    // Reconfigure this Mirage endpoint specifically for this test.
    this.server.pretender.get('/chart_types/', (request) => {
      assert.deepEqual(
        request.queryParams,
        { filter_group_id: this.filterGroup.id },
        'Chart types endpoint should be called with expected params'
      );
      let body = {
        data: [
          {
            type: 'chart-types',
            id: '1',
            attributes: {
              name: 'Type 1',
            },
          },
          {
            type: 'chart-types',
            id: '2',
            attributes: {
              name: 'Type 2',
            },
          },
        ],
      };
      return [200, {}, JSON.stringify(body)];
    });

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let chartTypesList = this.element.querySelector('ul.chart-type-list');
    let listItems = chartTypesList.querySelectorAll('li');
    let listItemsTexts = Array.from(listItems).map((listItem) =>
      listItem.textContent.trim()
    );
    assert.deepEqual(
      listItemsTexts,
      ['Type 1', 'Type 2'],
      'Listed chart types are as expected'
    );
  });

  test('lists the filters in the filter group', async function (assert) {
    // 2 filters in the filter group we'll check, 1 filter in another group
    createFilter(this, 'White Cat', 'choosable');
    createFilter(this, 'Blue Falcon', 'choosable');
    createFilter(this, 'Custom', 'implied');
    createFilter(this, 'Non-Custom', 'implied');
    createFilter(this, '30%', 'choosable', {
      filterGroup: this.numericFilterGroup,
      numericValue: 30,
    });

    await visit(`/filter-groups/${this.filterGroup.id}`);

    assert.ok(
      getFiltersListItemByName(this.element, 'Blue Falcon', 'choosable'),
      'Blue Falcon is on the choosable list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'White Cat', 'choosable'),
      'White Cat is on the choosable list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'Custom', 'implied'),
      'Custom is on the implied list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'Non-Custom', 'implied'),
      'Non-Custom is on the implied list'
    );
    assert.notOk(
      getFiltersListItemByName(this.element, '30%', 'choosable'),
      '30% is not on the choosable list'
    );
  });

  test('filter buttons change the selected filter', async function (assert) {
    createFilter(this, 'Blue Falcon', 'choosable');

    await visit(`/filter-groups/${this.filterGroup.id}`);

    let filterButton = getFiltersListItemByName(
      this.element,
      'Blue Falcon',
      'choosable'
    ).querySelector('button');
    await click(filterButton);

    // Check that the detail area shows the filter's details
    let filterDetailNameElement = this.element.querySelector(
      'div.filter-detail-section .filter-basic-fields > h2'
    );
    assert.ok(
      filterDetailNameElement,
      'Filter detail section is filled out after clicking the filter button'
    );
    let filterDetailName = filterDetailNameElement.textContent.trim();
    assert.equal(
      filterDetailName,
      'Blue Falcon',
      'Filter name display is as expected'
    );
  });

  test('choosable filters search box should work', async function (assert) {
    createFilter(this, 'Great Star', 'choosable');
    createFilter(this, 'Gallant Star-G4', 'choosable');
    createFilter(this, 'Astro Robin', 'choosable');

    await visit(`/filter-groups/${this.filterGroup.id}`);

    await fillIn('#choosable-filter-search', 'star');

    // Check that the filters updated accordingly. We're not focusing on the
    // nuances of the search logic, but we do want to make sure the update
    // propagation goes all the way to the filter list getting updated.
    assert.ok(
      getFiltersListItemByName(this.element, 'Great Star'),
      'GS should be on the list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'Gallant Star-G4'),
      'GSG4 should be on the list'
    );
    assert.notOk(
      getFiltersListItemByName(this.element, 'Astro Robin'),
      'AR should not be on the list'
    );
  });

  test('implied filters search box should work', async function (assert) {
    createFilter(this, 'B booster', 'implied');
    createFilter(this, 'C booster', 'implied');
    createFilter(this, 'D body', 'implied');

    await visit(`/filter-groups/${this.filterGroup.id}`);

    await fillIn('#implied-filter-search', 'boost');

    // Check that the filters updated accordingly.
    assert.ok(
      getFiltersListItemByName(this.element, 'B booster', 'implied'),
      'B booster should be on the list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'C booster', 'implied'),
      'C booster should be on the list'
    );
    assert.notOk(
      getFiltersListItemByName(this.element, 'D body', 'implied'),
      'D body should not be on the list'
    );
  });

  test.each(
    'filters list page buttons should work',
    ['choosable', 'implied'],
    async function (assert, filterType) {
      // Mirage should be specifying a page size of 10, so create 11 filters to
      // get multiple pages.
      for (let n = 1; n <= 11; n++) {
        // Filter 01, Filter 02, ..., Filter 11
        let filterNumber = n.toString().padStart(2, '0');
        createFilter(this, `Filter ${filterNumber}`, filterType);
      }

      await visit(`/filter-groups/${this.filterGroup.id}`);

      assert.ok(
        getFiltersListItemByName(this.element, 'Filter 01', filterType),
        'Page 1 should have filter 1'
      );
      assert.notOk(
        getFiltersListItemByName(this.element, 'Filter 11', filterType),
        'Page 1 should not have filter 11'
      );

      let buttons = this.element.querySelectorAll(
        `div.${filterType}-filter-list div.page-links button`
      );

      // First page-button should go to the next page, 2
      let nextPageButton = buttons[0];
      await click(nextPageButton);

      // Check that the filters updated accordingly. We want to make sure the
      // update propagation goes all the way to the filter list getting updated.
      assert.notOk(
        getFiltersListItemByName(this.element, 'Filter 01', filterType),
        'Page 2 should not have filter 1'
      );
      assert.ok(
        getFiltersListItemByName(this.element, 'Filter 11', filterType),
        'Page 2 should have filter 11'
      );
    }
  );
});
