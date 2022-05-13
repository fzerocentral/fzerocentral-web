import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | games/charts', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/charts');
    assert.ok(route);
  });
});
