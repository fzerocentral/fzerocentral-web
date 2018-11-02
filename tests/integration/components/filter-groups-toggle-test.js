import { module, test } from 'qunit';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter-groups-toggle', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();

    let store = this.owner.lookup('service:store');

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.groupB = server.create('filterGroup', {name: 'Group B'});
    this.groupC = server.create('filterGroup', {name: 'Group C'});

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('filterGroups', run(() => store.findAll('filterGroup')));
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

  test('it renders', async function(assert) {
    await render(hbs`{{filter-groups-toggle filterGroups=filterGroups onToggleUpdate=(action onToggleUpdate)}}`);

    assert.equal(this.element.textContent.trim(), 'Show all filter groups');
  });
});
