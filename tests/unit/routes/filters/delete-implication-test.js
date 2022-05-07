import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | filters/delete-implication', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:filters/delete-implication');
    assert.ok(route);
  });
});
