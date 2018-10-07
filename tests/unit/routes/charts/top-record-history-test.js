import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | charts/top-record-history', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:charts/top-record-history');
    assert.ok(route);
  });
});
