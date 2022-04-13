import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | filters/add-implication', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:filters/add-implication');
    assert.ok(route);
  });
});
