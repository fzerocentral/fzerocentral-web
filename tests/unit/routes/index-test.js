import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | index', function (hooks) {
  setupTest(hooks);

  test('should transition to games route', function (assert) {
    assert.expect(1);

    let route = this.owner.factoryFor('route:index').create({
      replaceWith(routeName) {
        assert.equal(routeName, 'games', 'transition to route name games');
      },
    });
    route.beforeModel();
  });
});
