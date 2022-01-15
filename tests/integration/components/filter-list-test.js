import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


function createFilter(server, name, group, type='choosable', value=null) {
  return createModelInstance(
    server, 'filter',
    {name: name, filterGroup: group, usageType: type, numericValue: value});
}


function getFiltersListItemByName(rootElement, name) {
  let filtersList = rootElement.querySelector('ul');
  let listItems = filtersList.querySelectorAll('li');

  // Return the first row which has this name; if no match, undefined
  return Array.from(listItems).find((listItem) => {
    return listItem.querySelector('button').textContent.trim() === name;
  });
}


module('Integration | Component | filter-list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.machineGroup = createModelInstance(
      this.server, 'filterGroup',
      {name: "Machine", kind: 'select'});
    this.gsg4Filter = createFilter(
      this.server, "Gallant Star-G4", this.machineGroup);
    this.qcg4Filter = createFilter(
      this.server, "Quick Cannon-G4", this.machineGroup);
    this.titang4Filter = createFilter(
      this.server, "Titan -G4 booster", this.machineGroup, 'implied');
    this.bCustomBoosterFilter = createFilter(
      this.server, "B custom booster", this.machineGroup, 'implied');

    this.allFilters = [
      this.gsg4Filter, this.qcg4Filter, this.titang4Filter,
      this.bCustomBoosterFilter];

    this.set(
      'updatePageNumber',
      (pageNumber) => this.set('pageNumber', pageNumber));
    this.set(
      'updateSearchText',
      (inputElement) => this.set('searchText', inputElement.target.value));
    this.set(
      'updateSelectedFilterId',
      (id) => this.set('selectedFilterId', id));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });


  test('should list the given filters', async function(assert) {
    let filters = [this.gsg4Filter, this.titang4Filter];
    filters.meta = {pagination: {count: 2}};
    this.set('filters', filters);
    await render(hbs`
      <FilterList
        @filters={{filters}}
        @updatePageNumber={{updatePageNumber}}
        @updateSearchText={{updateSearchText}}
        @updateSelectedFilterId={{updateSelectedFilterId}} />
    `);

    assert.ok(
      getFiltersListItemByName(this.element, "Gallant Star-G4"),
      "Gallant Star-G4 should be on the list");
    assert.ok(
      getFiltersListItemByName(this.element, "Titan -G4 booster"),
      "Titan -G4 booster should be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "Quick Cannon-G4"),
      "Quick Cannon-G4 should not be on the list");
  });

  test('should update pageNumber when page button is clicked', async function(assert) {
    let filters = [this.gsg4Filter, this.titang4Filter];
    filters.meta = {pagination: {count: 22, pages: 3, page: 1}};
    this.set('filters', filters);
    await render(hbs`
      <FilterList
        @filters={{filters}}
        @updatePageNumber={{updatePageNumber}}
        @updateSearchText={{updateSearchText}}
        @updateSelectedFilterId={{updateSelectedFilterId}} />
    `);

    let buttons = this.element.querySelectorAll('div.page-links button');

    // First page-button should go to the next page, 2
    let nextPageButton = buttons[0];
    await click(nextPageButton);
    assert.equal(2, this.get('pageNumber'), "pageNumber should be updated");
  });

  test('should update searchText when search field is filled', async function(assert) {
    let filters = this.allFilters;
    filters.meta = {pagination: {count: 4}};
    this.set('filters', filters);
    await render(hbs`
      <FilterList
        @filters={{filters}}
        @updatePageNumber={{updatePageNumber}}
        @updateSearchText={{updateSearchText}}
        @updateSelectedFilterId={{updateSelectedFilterId}} />
    `);

    await fillIn('.search-input', 'star');
    assert.equal(this.get('searchText'), 'star', "searchText should be updated");
  });

  test('should update selectedFilterId when clicking a list button', async function(assert) {
    let filters = this.allFilters;
    filters.meta = {pagination: {count: 4}};
    this.set('filters', filters);
    await render(hbs`
      <FilterList
        @filters={{filters}}
        @updatePageNumber={{updatePageNumber}}
        @updateSearchText={{updateSearchText}}
        @updateSelectedFilterId={{updateSelectedFilterId}} />
    `);

    let gsg4ListItem = getFiltersListItemByName(
      this.element, "Gallant Star-G4");
    let button = gsg4ListItem.querySelector('button');
    await click(button);

    assert.equal(
      this.get('selectedFilterId'), this.gsg4Filter.id,
      "selectedFilterId should be updated");
  });
});
