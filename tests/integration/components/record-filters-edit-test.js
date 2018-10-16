import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array'
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { selectChoose } from 'ember-power-select/test-support';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | record-filters-edit', function(hooks) {
  hooks.beforeEach( function() {
    this.server = startMirage();
  });
  hooks.afterEach( function() {
    this.server.shutdown();
  });
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    let store = this.owner.lookup('service:store');

    let groupA = server.create('filterGroup', {name: 'Group A'});
    server.create('filter', {name: 'Filter A1', filterGroups: [groupA]});
    server.create('filter', {name: 'Filter A2', filterGroups: [groupA]});
    let groupB = server.create('filterGroup', {name: 'Group B'});
    server.create('filter', {name: 'Filter B1', filterGroups: [groupB]});
    server.create('filter', {name: 'Filter B2', filterGroups: [groupB]});

    this.set('filterGroups', run(() => store.findAll('filterGroup')));
    this.set('filterGroupHashes', A([]));

    await render(hbs`
      {{record-filters-edit filterGroups=filterGroups filterGroupHashes=filterGroupHashes}}
    `);

    // textContent has a lot of newlines and extra spaces on either side of
    // them. We'll get rid of those before comparing.
    let textContentLines = [];
    this.element.textContent.split('\n').forEach((rawLine) => {
      let line = rawLine.trim();
      if (line !== '') { textContentLines.push(line); }
    })
    // Test text before picking filters.
    assert.deepEqual(textContentLines, [
      'Group A', '(Not specified)',
      'Group B', '(Not specified)']);

    // Pick filters.
    await selectChoose(`div.filter-group-${groupA.id}-select > .ember-power-select-trigger`, 'Filter A1');
    await selectChoose(`div.filter-group-${groupB.id}-select > .ember-power-select-trigger`, 'Filter B2');

    // Test text again.
    textContentLines = [];
    this.element.textContent.split('\n').forEach((rawLine) => {
      let line = rawLine.trim();
      if (line !== '') { textContentLines.push(line); }
    })
    assert.deepEqual(textContentLines, [
      'Group A', 'Filter A1',
      'Group B', 'Filter B2']);
  });
});
