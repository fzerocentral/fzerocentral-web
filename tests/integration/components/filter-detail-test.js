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

function addImplication(implyingFilter, impliedFilter) {
  let implications = implyingFilter.outgoingFilterImplications.models;
  implications.push(impliedFilter);
  implyingFilter.update('outgoingFilterImplications', implications);
}

function getImplicationList(rootElement, filters, direction) {
  let list;
  if (direction === 'incoming') {
    list = rootElement.querySelector('div.incoming-implications-list');
  }
  else {
    list = rootElement.querySelector('div.outgoing-implications-list');
  }
  let buttons = list.querySelectorAll('button.show-filter-detail-button');
  let implicationNames = [];
  buttons.forEach(
    button => {implicationNames.push(button.textContent.trim());});
  return implicationNames;
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

  test("should list outgoing implications for a choosable filter", async function(assert) {
    // Add some filter implications
    addImplication(this.gsg4Filter, this.titang4Filter);
    addImplication(this.gsg4Filter, this.bCustomBoosterFilter);
    addImplication(this.qcg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    assert.deepEqual(
      getImplicationList(this.element, this.gsg4Filter, 'outgoing'),
      [this.bCustomBoosterFilter.name, this.titang4Filter.name],
      "Should list outgoing implications of only this filter");
  });

  test("should list incoming implications for an implied filter", async function(assert) {
    // Add some filter implications
    addImplication(this.gsg4Filter, this.titang4Filter);
    addImplication(this.gsg4Filter, this.bCustomBoosterFilter);
    addImplication(this.qcg4Filter, this.titang4Filter);
    addImplication(this.titang4Filter, this.bCustomBoosterFilter);

    this.set('filterId', this.titang4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    assert.deepEqual(
      getImplicationList(this.element, this.titang4Filter, 'incoming'),
      [this.gsg4Filter.name, this.qcg4Filter.name],
      "Should list only incoming implications of only this filter");
  });

  test("should allow creating an outgoing filter implication", async function(assert) {
    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Select the filter to imply, and click create.
    let form =
      this.element.querySelector('.filter-implication-create-form');
    let filterSelect = form.querySelector(
      'div.target-filter-select .ember-power-select-trigger');
    await selectChoose(filterSelect, "Titan -G4 booster");
    let createButton = form.querySelector('.create-button');
    await click(createButton);

    assert.strictEqual(
      this.element.querySelector(
        '.filter-implication-create-form .error-message').textContent.trim(),
      "",
      "Shouldn't show a creation error");

    let implicationNames = Array.from(
      this.gsg4Filter.outgoingFilterImplications.models).map(f => f.name);
    assert.deepEqual(
      implicationNames, [this.titang4Filter.name],
      "Expected implication should be created");

    assert.deepEqual(
      getImplicationList(this.element, this.gsg4Filter, 'outgoing'),
      [this.titang4Filter.name],
      "New implication should be on the list");
  });

  test("should allow deleting an outgoing filter implication", async function(assert) {
    addImplication(this.gsg4Filter, this.titang4Filter);
    addImplication(this.gsg4Filter, this.bCustomBoosterFilter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Select the implication from the existing implications dropdown.
    // Then delete it.
    let form =
      this.element.querySelector('.filter-implication-delete-form');
    let implicationSelect = form.querySelector(
      'div.implication-select .ember-power-select-trigger');
    await selectChoose(implicationSelect, "Titan -G4 booster");
    let deleteButton = form.querySelector('.delete-button');
    await click(deleteButton);

    assert.strictEqual(
      this.element.querySelector(
        '.filter-implication-delete-form .error-message').textContent.trim(),
      "",
      "Shouldn't show a deletion error");

    let implicationNames = Array.from(
      this.gsg4Filter.outgoingFilterImplications.models).map(f => f.name);
    assert.deepEqual(
      implicationNames, [this.bCustomBoosterFilter.name],
      "Deleted implication should no longer exist");

    assert.deepEqual(
      getImplicationList(this.element, this.gsg4Filter, 'outgoing'),
      [this.bCustomBoosterFilter.name],
      "Deleted implication should no longer be on the list");
  });

  test("filter buttons should change the selected filter", async function(assert) {
    addImplication(this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Click a button in the outgoing-implications list
    let buttons = this.element.querySelectorAll(
      'div.outgoing-implications-list button.show-filter-detail-button');
    let button = Array.from(buttons).find(
      b => b.textContent.trim() === this.titang4Filter.name);
    await click(button);

    assert.equal(
      this.get('filterId'), this.titang4Filter.id,
      "Selected filter should have changed");
  });

  test("forms should be reset when switching the selected filter", async function(assert) {
    addImplication(this.gsg4Filter, this.titang4Filter);

    this.set('filterId', this.gsg4Filter.id);
    this.set('filterGroupId', this.machineGroup.id);
    await render(
      hbs`<FilterDetail @filterId={{filterId}} @filterGroupId={{filterGroupId}} />`);

    // Fill in field(s) on the implication creation form
    let implicationCreateForm =
      this.element.querySelector('.filter-implication-create-form');
    let filterSelect = implicationCreateForm.querySelector(
      'div.target-filter-select .ember-power-select-trigger');
    await selectChoose(filterSelect, "B custom booster");
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "B custom booster",
      "Filter selection should be filled in");

    // Fill in field(s) on the implication deletion form
    let implicationDeleteForm =
      this.element.querySelector('.filter-implication-delete-form');
    let implicationSelect = implicationDeleteForm.querySelector(
      'div.implication-select .ember-power-select-trigger');
    await selectChoose(implicationSelect, "Titan -G4 booster");
    assertPowerSelectCurrentTextEqual(
      assert, implicationSelect, "Titan -G4 booster",
      "Implication selection should be filled in");

    // Start editing the filter details
    let editForm = this.element.querySelector('div.filter-edit-form');
    let editButton =
      this.element.querySelector('button.start-editing-filter-button');
    await click(editButton);
    assert.notEqual(
      getComputedStyle(editForm).display, 'none',
      "Edit form should be showing");

    // Click a button in the outgoing-implications list
    let buttons = this.element.querySelectorAll(
      'div.outgoing-implications-list button.show-filter-detail-button');
    let button = Array.from(buttons).find(
      b => b.textContent.trim() === this.titang4Filter.name);
    await click(button);

    implicationCreateForm =
      this.element.querySelector('.filter-implication-create-form');
    filterSelect = implicationCreateForm.querySelector(
      'div.target-filter-select .ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, filterSelect, "Not selected",
      "Filter selection should be reset");

    implicationDeleteForm =
      this.element.querySelector('.filter-implication-delete-form');
    implicationSelect = implicationDeleteForm.querySelector(
      'div.implication-select .ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, implicationSelect, "Not selected",
      "Implication selection should be reset");

    editForm = this.element.querySelector('div.filter-edit-form');
    assert.equal(
      getComputedStyle(editForm).display, 'none',
      "Detail edit form should be hidden again");
  });
});
