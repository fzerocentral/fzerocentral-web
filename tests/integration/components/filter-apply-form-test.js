import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from "@ember/runloop";
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter-apply-form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.filterA1 = server.create('filter', {name: 'Filter A1', filterGroup: this.groupA});
    this.filterA2 = server.create('filter', {name: 'Filter A2', filterGroup: this.groupA});
  });

  test('it renders', async function(assert) {
    this.set('filterGroups', run(() => this.store.findAll('filterGroup')));
    this.set('appliedFiltersString', `${this.filterA1.id}`);
    await render(hbs`{{filter-apply-form filterGroups=filterGroups appliedFiltersString=appliedFiltersString}}`);

    // textContent has a lot of newlines and extra spaces on either side of
    // them. We'll get rid of those before comparing.
    let textContentLines = [];
    this.element.textContent.split('\n').forEach((rawLine) => {
      let line = rawLine.trim();
      if (line !== '') {
        textContentLines.push(line);
      }
    })
    assert.deepEqual(textContentLines, [
      "Add filter:", "Not selected", "Not selected", "Not selected", "Add",
      "Applied filters:", "Group A: Filter A1", "x"]);
  });
});
