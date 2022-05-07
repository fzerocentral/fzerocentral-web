import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { DummyModel } from '../../utils/models';

function getFiltersListItemByName(rootElement, name) {
  let filtersList = rootElement.querySelector('ul');
  let listItems = filtersList.querySelectorAll('li');

  // Return the first row which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('button').textContent.trim() === name;
  });
}

module('Integration | Component | filter-list', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let g = new DummyModel({ id: '1', name: 'G', kind: 'select' });
    this.f1 = new DummyModel({ id: '1', name: 'F1', filterGroup: g });
    this.f2 = new DummyModel({ id: '2', name: 'F2', filterGroup: g });
    this.f3 = new DummyModel({ id: '3', name: 'F3', filterGroup: g });
    this.f4 = new DummyModel({ id: '4', name: 'F4', filterGroup: g });

    this.set('updatePageNumber', (pageNumber) =>
      this.set('pageNumber', pageNumber)
    );
    this.set('updateSearchText', (newText) => this.set('searchText', newText));
    this.set('updateSelectedFilterId', (id) =>
      this.set('selectedFilterId', id)
    );
  });

  test('should list the given filters', async function (assert) {
    let filters = [this.f1, this.f2];
    filters.meta = { pagination: { count: 2 } };
    this.set('filters', filters);

    await render(hbs`
      <FilterList
        @searchFieldId='search'
        @filters={{this.filters}}
        @updatePageNumber={{this.updatePageNumber}}
        @updateSearchText={{this.updateSearchText}}
        @updateSelectedFilterId={{this.updateSelectedFilterId}} />
    `);

    assert.ok(
      getFiltersListItemByName(this.element, 'F1'),
      'F1 should be on the list'
    );
    assert.ok(
      getFiltersListItemByName(this.element, 'F2'),
      'F2 should be on the list'
    );
    assert.notOk(
      getFiltersListItemByName(this.element, 'F3'),
      'F3 should not be on the list'
    );
  });

  test('should update pageNumber when page button is clicked', async function (assert) {
    let filters = [this.f1, this.f2];
    filters.meta = { pagination: { pages: 3, page: 1 } };
    this.set('filters', filters);

    await render(hbs`
      <FilterList
        @searchFieldId='search'
        @filters={{this.filters}}
        @updatePageNumber={{this.updatePageNumber}}
        @updateSearchText={{this.updateSearchText}}
        @updateSelectedFilterId={{this.updateSelectedFilterId}} />
    `);

    let buttons = this.element.querySelectorAll('div.page-links button');

    // First page-button should go to the next page, 2
    let nextPageButton = buttons[0];
    await click(nextPageButton);
    assert.equal(this.pageNumber, 2, 'pageNumber should be updated');
  });

  test('should update searchText when search field is filled', async function (assert) {
    let filters = [this.f1, this.f2, this.f3, this.f4];
    filters.meta = { pagination: { count: 4 } };
    this.set('filters', filters);

    await render(hbs`
      <FilterList
        @searchFieldId='search'
        @filters={{this.filters}}
        @updatePageNumber={{this.updatePageNumber}}
        @updateSearchText={{this.updateSearchText}}
        @updateSelectedFilterId={{this.updateSelectedFilterId}} />
    `);

    await fillIn('#search', 'star');
    assert.equal(this.searchText, 'star', 'searchText should be updated');
  });

  test('should update selectedFilterId when clicking a list button', async function (assert) {
    let filters = [this.f1, this.f2, this.f3, this.f4];
    filters.meta = { pagination: { count: 4 } };
    this.set('filters', filters);

    await render(hbs`
      <FilterList
        @searchFieldId='search'
        @filters={{this.filters}}
        @updatePageNumber={{this.updatePageNumber}}
        @updateSearchText={{this.updateSearchText}}
        @updateSelectedFilterId={{this.updateSelectedFilterId}} />
    `);

    let f1ListItem = getFiltersListItemByName(this.element, 'F1');
    let button = f1ListItem.querySelector('button');
    await click(button);

    assert.equal(
      this.selectedFilterId,
      '1',
      'selectedFilterId should be updated'
    );
  });
});
