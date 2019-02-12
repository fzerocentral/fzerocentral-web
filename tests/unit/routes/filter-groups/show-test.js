import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | filter-groups/show', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:filter-groups/show');
    assert.ok(route);
  });
});
