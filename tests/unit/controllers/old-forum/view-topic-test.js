import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | old-forum/view-topic', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:old-forum/view-topic');
    assert.ok(controller);
  });
});
