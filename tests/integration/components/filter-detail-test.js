import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { run } from "@ember/runloop";
import { click, render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { assertPowerSelectCurrentTextEqual }
  from 'fzerocentral-web/tests/helpers/power-select-helpers';


function createFilter(server, name, group, type='choosable', value=null) {
  return createModelInstance(
    server, 'filter',
    {name: name, filterGroup: group, usageType: type, numericValue: value});
}

function createLink(server, implyingFilter, impliedFilter) {
  return createModelInstance(
    server, 'filter-implication-link',
    {implyingFilter: implyingFilter, impliedFilter: impliedFilter});
}

function getImplicationLinkButtonByFilter(rootElement, filter, direction) {
  let list = null;
  if (direction === 'incoming') {
    list = rootElement.querySelector('ul.incoming-implication-links-list');
  }
  else {
    list = rootElement.querySelector('ul.outgoing-implication-links-list');
  }
  let buttons = list.querySelectorAll('button.show-filter-detail-button');
  // Return the first button which has this name; if no match, undefined
  return Array.from(buttons).find((button) => {
    return button.textContent.trim() === filter.name;
  });
}


module('Integration | Component | filter-detail', function(hooks) {
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

    this.settingGroup = createModelInstance(
      this.server, 'filterGroup',
      {name: "Setting", kind: 'numeric'});
    this.s30Filter = createFilter(
      this.server, "30%", this.settingGroup, 'choosable', 30);
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });


  test("can show a filter's details", async function(assert) {
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    let detailSection = this.element.querySelector('.filter-basic-fields');
    let detailSectionName =
      detailSection.querySelector('h2').textContent.trim();
    let detailSectionType =
      detailSection.getElementsByTagName('div')[0].textContent.trim();
    assert.equal(
      detailSectionName, "Gallant Star-G4",
      "Detail section shows the expected name");
    assert.equal(
      detailSectionType, "Type: choosable",
      "Detail section shows the expected type");
  });

  test("can show a numeric filter's details", async function(assert) {
    this.set('filterId', this.s30Filter.id);
    this.set('filterGroupId', this.settingGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    let detailSection = this.element.querySelector('.filter-basic-fields');
    let detailSectionName =
      detailSection.querySelector('h2').textContent.trim();
    let detailSectionValue =
      detailSection.getElementsByTagName('div')[0].textContent.trim();
    assert.equal(
      detailSectionName, "30%",
      "Detail section shows the expected name");
    assert.equal(
      detailSectionValue, "Numeric value: 30",
      "Detail section shows the expected value");
  });

  test("can bring up and dismiss the filter edit form", async function(assert) {
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    let detailDisplay = this.element.querySelector('div.filter-basic-fields');
    let editForm = this.element.querySelector('div.filter-edit-form');
    let editButton =
      this.element.querySelector('button.start-editing-filter-button');
    let saveButton = editForm.querySelector('button.save-button');
    let cancelButton = editForm.querySelector('button.cancel-button');
    // Initially, details should be shown, and edit form should be hidden
    assert.notEqual(
      getComputedStyle(detailDisplay).display, 'none',
      "Detail display is initially visible");
    assert.equal(
      getComputedStyle(editForm).display, 'none',
      "Edit form is initially hidden");

    // By clicking Edit button, visibility should be swapped
    await click(editButton);
    assert.equal(
      getComputedStyle(detailDisplay).display, 'none',
      "After clicking Edit, Detail display is hidden");
    assert.notEqual(
      getComputedStyle(editForm).display, 'none',
      "After clicking Edit, Edit form is visible");

    // By clicking Save button, visibility should revert
    await click(saveButton);
    assert.notEqual(
      getComputedStyle(detailDisplay).display, 'none',
      "After clicking Save, Detail display is visible");
    assert.equal(
      getComputedStyle(editForm).display, 'none',
      "After clicking Save, Edit form is hidden");

    // By clicking Edit button, then Cancel button, visibility should revert
    await click(editButton);
    await click(cancelButton);
    assert.notEqual(
      getComputedStyle(detailDisplay).display, 'none',
      "After clicking Cancel, Detail display is visible");
    assert.equal(
      getComputedStyle(editForm).display, 'none',
      "After clicking Cancel, Edit form is hidden");
  });

  test("can edit a filter's fields", async function(assert) {
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    let editForm = this.element.querySelector('div.filter-edit-form');
    let editButton =
      this.element.querySelector('button.start-editing-filter-button');
    let saveButton = editForm.querySelector('button.save-button');

    // Change filter name
    await click(editButton);
    let nameInput = editForm.querySelector('input[name="name"]');
    fillIn(nameInput, "Golden Fox");
    await click(saveButton);

    let filters = run(() => this.store.findAll('filter'));
    let changedFilter = filters.find((filter) => {
      return filter.get('id') === this.gsg4Filter.id;
    });
    assert.equal(
      changedFilter.get('name'), "Golden Fox",
      "Filter name was changed as expected");
  });

  test("can edit a numeric filter's fields", async function(assert) {
    this.set('filterId', this.s30Filter.id);
    this.set('filterGroupId', this.settingGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    let editForm = this.element.querySelector('div.filter-edit-form');
    let editButton =
      this.element.querySelector('button.start-editing-filter-button');
    let saveButton = editForm.querySelector('button.save-button');

    // Change filter name
    await click(editButton);
    let nameInput = editForm.querySelector('input[name="name"]');
    fillIn(nameInput, "60%");
    let valueInput = editForm.querySelector('input[name="numeric-value"]');
    fillIn(valueInput, 60);
    await click(saveButton);

    let filters = run(() => this.store.findAll('filter'));
    let changedFilter = filters.find((filter) => {
      return filter.get('id') === this.s30Filter.id;
    });
    assert.equal(
      changedFilter.get('name'), "60%",
      "Filter name was changed as expected");
    assert.equal(
      changedFilter.get('numericValue'), 60,
      "Filter's numeric value was changed as expected");
  });

  test("can delete a filter", async function(assert) {
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Delete filter
    let deleteButton = this.element.querySelector('.filter-delete-button');
    await click(deleteButton);

    let filters = run(() => this.store.findAll('filter'));
    let formerFilter = filters.find((filter) => {
      return filter.get('name') === "Gallant Star-G4";
    });
    // Note: If this assertion fails, it might fail with a
    // `this.get(...).internalModel is undefined` error instead of a regular
    // assertion error. No idea why.
    assert.notOk(formerFilter, "Filter was deleted")
  });

  test("lists the filter implication links in the filter group", async function(assert) {
    // Add some filter implication links
    createLink(this.server, this.gsg4Filter, this.titang4Filter);
    createLink(this.server, this.qcg4Filter, this.titang4Filter);
    createLink(this.server, this.titang4Filter, this.bCustomBoosterFilter);

    this.set('filterId', this.titang4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    assert.ok(
      getImplicationLinkButtonByFilter(
        this.element, this.gsg4Filter, 'incoming'),
      "1st expected incoming link is shown");
    assert.ok(
      getImplicationLinkButtonByFilter(
        this.element, this.qcg4Filter, 'incoming'),
      "2nd expected incoming link is shown");
    assert.ok(
      getImplicationLinkButtonByFilter(
        this.element, this.bCustomBoosterFilter, 'outgoing'),
      "Expected outgoing link is shown");
  });

  test("can create a new filter implication link from the incoming filter", async function(assert) {
    // Have the component focus on the incoming filter.
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // On the link creation form, select 'to', select the outgoing filter,
    // and click create.
    let form =
      this.element.querySelector('.filter-implication-link-create-form');
    let directionSelect = form.querySelector(
      'div.link-direction-select .ember-power-select-trigger');
    await selectChoose(directionSelect, "to");
    let filterSelect = form.querySelector(
      'div.linked-filter-select .ember-power-select-trigger');
    await selectChoose(filterSelect, "Titan -G4 booster");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    // Link should be created.
    let links = run(() => this.store.findAll('filter-implication-link'));
    let newLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Titan -G4 booster");
    });
    assert.ok(newLink, "Expected link was created");

    // Link should be on the list (list should have been refreshed)
    assert.ok(
      getImplicationLinkButtonByFilter(
        this.element, this.titang4Filter, 'outgoing'),
      "New link is on the list");
  });

  test("can create a new filter implication link from the outgoing filter", async function(assert) {
    // Have the component focus on the outgoing filter.
    this.set('filterId', this.titang4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // On the link creation form, select 'from', select the incoming filter,
    // and click create.
    let form =
      this.element.querySelector('.filter-implication-link-create-form');
    let directionSelect = form.querySelector(
      'div.link-direction-select .ember-power-select-trigger');
    await selectChoose(directionSelect, "from");
    let filterSelect = form.querySelector(
      'div.linked-filter-select .ember-power-select-trigger');
    await selectChoose(filterSelect, "Gallant Star-G4");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    // Link should be created.
    let links = run(() => this.store.findAll('filter-implication-link'));
    let newLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Titan -G4 booster");
    });
    assert.ok(newLink, "Expected link was created");

    // Link should be on the list (list should have been refreshed)
    assert.ok(
      getImplicationLinkButtonByFilter(
        this.element, this.gsg4Filter, 'incoming'),
      "New link is on the list");
  });

  test("can delete an outgoing filter implication link", async function(assert) {
    createLink(this.server, this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Select the link from the existing links dropdown. Then delete it.
    let form =
      this.element.querySelector('.filter-implication-link-delete-form');
    let linkSelect = form.querySelector(
      'div.link-select .ember-power-select-trigger');
    await selectChoose(linkSelect, "to Titan -G4 booster");
    let deleteButton = form.querySelector('.delete-button');
    await click(deleteButton);

    // Link should be deleted
    let links = run(() => this.store.findAll('filter-implication-link'));
    let newLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Titan -G4 booster");
    });
    assert.notOk(newLink, "Link does not exist anymore");

    // Link should be on the list (list should have been refreshed)
    assert.notOk(
      getImplicationLinkButtonByFilter(
        this.element, this.titang4Filter, 'outgoing'),
      "Link is no longer the list");
  });

  test("can delete an incoming filter implication link", async function(assert) {
    createLink(this.server, this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.titang4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Select the link from the existing links dropdown. Then delete it.
    let form =
      this.element.querySelector('.filter-implication-link-delete-form');
    let linkSelect = form.querySelector(
      'div.link-select .ember-power-select-trigger');
    await selectChoose(linkSelect, "from Gallant Star-G4");
    let deleteButton = form.querySelector('.delete-button');
    await click(deleteButton);

    // Link should be deleted
    let links = run(() => this.store.findAll('filter-implication-link'));
    let newLink = links.find((link) => {
      return (
        link.get('implyingFilter').get('name') === "Gallant Star-G4"
        && link.get('impliedFilter').get('name') === "Titan -G4 booster");
    });
    assert.notOk(newLink, "Link does not exist anymore");

    // Link should be on the list (list should have been refreshed)
    assert.notOk(
      getImplicationLinkButtonByFilter(
        this.element, this.gsg4Filter, 'incoming'),
      "Link is no longer the list");
  });

  test("filter buttons change the selected filter", async function(assert) {
    createLink(this.server, this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Click a button in one of the linked-filters lists
    let filterButton = getImplicationLinkButtonByFilter(
      this.element, this.titang4Filter, 'outgoing');
    await click(filterButton);

    // Check that the filter changed
    assert.equal(this.filterId, this.titang4Filter.id);
  });

  test("forms are reset when switching the selected filter", async function(assert) {
    createLink(this.server, this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Select choices on the link creation form
    let linkCreateForm =
      this.element.querySelector('.filter-implication-link-create-form');
    let directionSelect = linkCreateForm.querySelector(
      'div.link-direction-select .ember-power-select-trigger');
    await selectChoose(directionSelect, "to");
    let filterSelect = linkCreateForm.querySelector(
      'div.linked-filter-select .ember-power-select-trigger');
    await selectChoose(filterSelect, "B custom booster");
    assertPowerSelectCurrentTextEqual(
      assert, directionSelect, "to",
      "Direction selection is filled in");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "B custom booster",
      "Filter selection is filled in");

    // Select a choice on the link deletion form
    let linkDeleteForm =
      this.element.querySelector('.filter-implication-link-delete-form');
    let linkSelect = linkDeleteForm.querySelector(
      'div.link-select .ember-power-select-trigger');
    await selectChoose(linkSelect, "to Titan -G4 booster");
    assertPowerSelectCurrentTextEqual(
      assert, linkSelect, "to Titan -G4 booster",
      "Link selection is filled in");

    // Start editing the filter details
    let editForm = this.element.querySelector('div.filter-edit-form');
    let editButton =
      this.element.querySelector('button.start-editing-filter-button');
    await click(editButton);
    assert.notEqual(
      getComputedStyle(editForm).display, 'none',
      "Edit form is showing");

    // Click a button in one of the linked-filters lists
    let filterButton = getImplicationLinkButtonByFilter(
      this.element, this.titang4Filter, 'outgoing');
    await click(filterButton);

    // Link creation form should be reset
    linkCreateForm =
      this.element.querySelector('.filter-implication-link-create-form');
    directionSelect = linkCreateForm.querySelector(
      'div.link-direction-select .ember-power-select-trigger');
    filterSelect = linkCreateForm.querySelector(
      'div.linked-filter-select .ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, directionSelect, "Not selected",
      "Direction selection is reset");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "Not selected",
      "Filter selection is reset");

    // Link deletion form should be reset
    linkDeleteForm =
      this.element.querySelector('.filter-implication-link-delete-form');
    linkSelect = linkDeleteForm.querySelector(
      'div.link-select .ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, linkSelect, "Not selected",
      "Link selection is reset");

    // Filter detail editing should be canceled
    editForm = this.element.querySelector('div.filter-edit-form');
    assert.equal(
      getComputedStyle(editForm).display, 'none',
      "Edit form is hidden again");
  });
});
