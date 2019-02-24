import { module, test } from 'qunit';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance, modelAsProperty }
  from 'fzerocentral-web/tests/helpers/model-helpers';

module('Integration | Component | filter-groups-toggle', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.default1 = createModelInstance(
      this.server, 'filterGroup', {name: "D1", showByDefault: true});
    this.nonDefault1 = createModelInstance(
      this.server, 'filterGroup', {name: "ND1", showByDefault: false});
    this.default2 = createModelInstance(
      this.server, 'filterGroup', {name: "D2", showByDefault: true});
    this.nonDefault2 = createModelInstance(
      this.server, 'filterGroup', {name: "ND2", showByDefault: false});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('shownFilterGroups', A([]));
    this.set('onToggleUpdate', (newShownFilterGroups) => {
      // Clear old filter groups
      this.get('shownFilterGroups').clear();
      // Add new set of filter groups
      newShownFilterGroups.forEach((filterGroup) => {
        this.get('shownFilterGroups').pushObject(filterGroup);
      });
    });
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('works with 0 filter groups', async function(assert) {
    this.set('filterGroups', []);
    await render(
      hbs`{{filter-groups-toggle filterGroups=filterGroups
            onToggleUpdate=(action onToggleUpdate)}}`);

    await click('input[name="showAllFilterGroups"]');
    assert.deepEqual(
      this.get('shownFilterGroups'), [], "0 groups shown when checked");

    await click('input[name="showAllFilterGroups"]');
    assert.deepEqual(
      this.get('shownFilterGroups'), [], "0 groups shown when unchecked");
  });

  test('works with 2 non-default filter groups', async function(assert) {
    this.set(
      'filterGroups',
      [this.nonDefault1, this.nonDefault2].map(
        fg => modelAsProperty(this.store, 'filterGroup', fg)));
    await render(
      hbs`{{filter-groups-toggle filterGroups=filterGroups
            onToggleUpdate=(action onToggleUpdate)}}`);

    await click('input[name="showAllFilterGroups"]');
    let shownFGNames = this.get('shownFilterGroups').map(fg => fg.get('name'));
    assert.deepEqual(
      shownFGNames, ["ND1", "ND2"], "2 groups shown when checked");

    await click('input[name="showAllFilterGroups"]');
    shownFGNames = this.get('shownFilterGroups').map(fg => fg.get('name'));
    assert.deepEqual(
      shownFGNames, [], "0 groups shown when unchecked");
  });

  test('works with 2 default and 2 non-default filter groups', async function(assert) {
    this.set(
      'filterGroups',
      [this.default1, this.nonDefault1, this.default2, this.nonDefault2].map(
        fg => modelAsProperty(this.store, 'filterGroup', fg)));
    await render(
      hbs`{{filter-groups-toggle filterGroups=filterGroups
            onToggleUpdate=(action onToggleUpdate)}}`);

    await click('input[name="showAllFilterGroups"]');
    let shownFGNames = this.get('shownFilterGroups').map(fg => fg.get('name'));
    assert.deepEqual(
      shownFGNames, ["D1", "ND1", "D2", "ND2"], "4 groups shown when checked");

    await click('input[name="showAllFilterGroups"]');
    shownFGNames = this.get('shownFilterGroups').map(fg => fg.get('name'));
    assert.deepEqual(
      shownFGNames, ["D1", "D2"], "2 groups shown when unchecked");
  });
});
