import { module, test } from 'qunit';
import { setupTest } from 'fzerocentral-web/tests/helpers';

module('Unit | Service | asset-map', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:asset-map');
    assert.ok(service);
  });
});
