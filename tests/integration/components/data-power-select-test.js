import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { selectChoose, selectSearch }
  from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance, modelAsProperty }
  from 'fzerocentral-web/tests/helpers/model-helpers';
import { assertPowerSelectCurrentTextEqual, assertPowerSelectOptionsEqual }
  from 'fzerocentral-web/tests/helpers/power-select-helpers';


function createFilter(server, name, group, type='choosable', value=null) {
  return createModelInstance(
    server, 'filter',
    {name: name, filterGroup: group, usageType: type, numericValue: value});
}


module('Integration | Component | data-power-select', function(hooks) {
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

    // Individual tests can set property values to something else.
    this.set('selectedFilter', null);
    this.set(
      'filterGroup',
      modelAsProperty(this.store, 'filterGroup', this.machineGroup));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });


  test('placeholder text works', async function(assert) {
    await render(hbs`
      {{#data-power-select
        modelName="filter"
        selected=selectedFilter
        onchange=(action (mut selectedFilter))
        placeholder="Not selected"
        as |option|}}
        {{option.name}}
      {{/data-power-select}}
    `);

    let select = this.element.querySelector(
      '.ember-power-select-trigger');
    assertPowerSelectCurrentTextEqual(
      assert, select, "Not selected",
      "Placeholder text is as expected");
  });

  test('can populate choices with model instances and filter the choices by params', async function(assert) {
    await render(hbs`
      {{#data-power-select
        modelName="filter"
        params=(hash filter_group_id=filterGroup.id)
        selected=selectedFilter
        onchange=(action (mut selectedFilter))
        placeholder="Not selected"
        as |option|}}
        {{option.name}}
      {{/data-power-select}}
    `);

    let select = this.element.querySelector(
      '.ember-power-select-trigger');
    await assertPowerSelectOptionsEqual(
      assert, select,
      ["B custom booster", "Gallant Star-G4",
       "Quick Cannon-G4", "Titan -G4 booster"],
      "Choices are filtered as expected");
  });

  test('can select a choice', async function(assert) {
    await render(hbs`
      {{#data-power-select
        modelName="filter"
        params=(hash filter_group_id=filterGroup.id)
        selected=selectedFilter
        onchange=(action (mut selectedFilter))
        placeholder="Not selected"
        as |option|}}
        {{option.name}}
      {{/data-power-select}}
    `);

    let select = this.element.querySelector(
      '.ember-power-select-trigger');
    await selectChoose(select, "Quick Cannon-G4");
    assertPowerSelectCurrentTextEqual(
      assert, select, "Quick Cannon-G4",
      "Choice was correctly selected");
  });

  test('can type in the search field to modify the choices query', async function(assert) {
    await render(hbs`
      {{#data-power-select
        modelName="filter"
        params=(hash filter_group_id=filterGroup.id)
        queryKey="name_search"
        selected=selectedFilter
        onchange=(action (mut selectedFilter))
        placeholder="Not selected"
        as |option|}}
        {{option.name}}
      {{/data-power-select}}
    `);

    let select = this.element.querySelector(
      '.ember-power-select-trigger');
    // Type in the search field
    await selectSearch(select, "booster");

    // We won't check the actual choices since those depend on model-specific
    // filtering being implemented in Mirage. However, we'll check that the
    // appropriate request was made to Mirage.
    const queryUrl =
      `/filters?filter_group_id=${this.machineGroup.id}&name_search=booster`;
    const queryRequest = server.pretender.handledRequests.find((request) => {
      return request.url === queryUrl && request.method === 'GET';
    });
    assert.ok(queryRequest, 'Choices query is correct');
  });
});
