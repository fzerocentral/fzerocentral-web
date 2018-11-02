import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | charts/user-history', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:charts/user-history');
    assert.ok(controller);
  });
});
