import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | find-filter-of-group', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();

    this.groupA = server.create('filterGroup', {name: 'Group A'});
    this.filterA1 = server.create('filter', {name: 'Filter A1', filterGroup: this.groupA});
    this.groupB = server.create('filterGroup', {name: 'Group B'});
    this.filterB1 = server.create('filter', {name: 'Filter B1', filterGroup: this.groupB});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it renders', async function(assert) {
    let store = this.owner.lookup('service:store');
    this.set('filters', store.findAll('filter'));
    this.set('filterGroupId', this.groupB.id);
    await render(hbs`{{get (find-filter-of-group filters filterGroupId) "name"}}`);

    assert.equal(this.element.textContent.trim(), 'Filter B1');
  });
});
