import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | charts/top-record-history', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:charts/top-record-history');
    assert.ok(controller);
  });
});
