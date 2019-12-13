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

    this.platformGroup = createModelInstance(
      this.server, 'filterGroup',
      {name: "Platform", kind: 'select'});
    this.gamecubeFilter = createFilter(
      this.server, "Gamecube", this.platformGroup);

    this.set('filterGroupId', this.machineGroup.id);
    this.set(
      'updateSelectedFilterId',
      (id) => this.set('selectedFilterId', id));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });


  test('should list choosable filters', async function(assert) {
    await render(hbs`
      <FilterList
        @filterGroupId={{filterGroupId}}
        @updateSelectedFilterId={{updateSelectedFilterId}}
        @usageType="choosable" />
    `);

    assert.ok(
      getFiltersListItemByName(this.element, "Gallant Star-G4"),
      "Gallant Star-G4 should be on the list");
    assert.ok(
      getFiltersListItemByName(this.element, "Quick Cannon-G4"),
      "Quick Cannon-G4 should be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "Titan -G4 booster"),
      "Titan -G4 booster (implied) shouldn't be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "B custom booster"),
      "B custom booster (implied) shouldn't be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "Gamecube"),
      "Gamecube (other group) shouldn't be on the list");
  });

  test('should list implied filters', async function(assert) {
    await render(hbs`
      <FilterList
        @filterGroupId={{filterGroupId}}
        @updateSelectedFilterId={{updateSelectedFilterId}}
        @usageType="implied" />
    `);

    assert.notOk(
      getFiltersListItemByName(this.element, "Gallant Star-G4"),
      "Gallant Star-G4 (choosable) shouldn't be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "Quick Cannon-G4"),
      "Quick Cannon-G4 (choosable) shouldn't be on the list");
    assert.ok(
      getFiltersListItemByName(this.element, "Titan -G4 booster"),
      "Titan -G4 booster should be on the list");
    assert.ok(
      getFiltersListItemByName(this.element, "B custom booster"),
      "B custom booster should be on the list");
    assert.notOk(
      getFiltersListItemByName(this.element, "Gamecube"),
      "Gamecube (other group) shouldn't be on the list");
  });

  test('filter query should account for search text', async function(assert) {
    await render(hbs`
      <FilterList
        @filterGroupId={{filterGroupId}}
        @updateSelectedFilterId={{updateSelectedFilterId}}
        @usageType="choosable" />
    `);

    await fillIn('.search-input', 'star');

    const queryRequest = server.pretender.handledRequests.find((request) => {
      return (
        request.url.includes('name_search=star') && request.method === 'GET');
    });
    assert.ok(queryRequest, "Should find a query using the search text");
  });

  test('should update selectedFilterId when clicking a list button', async function(assert) {
    await render(hbs`
      <FilterList
        @filterGroupId={{filterGroupId}}
        @updateSelectedFilterId={{updateSelectedFilterId}}
        @usageType="choosable" />
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
