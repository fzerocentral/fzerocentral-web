import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { visit } from '@ember/test-helpers';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | games/chart-types', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', {
      name: 'Game 1',
      shortCode: 'g1',
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/chart-types');
    assert.ok(route);
  });

  test('lists chart types for the game', async function (assert) {
    assert.expect(3);

    this.server.pretender.get('/chart_types/', (request) => {
      assert.deepEqual(
        request.queryParams,
        { game_code: this.game.shortCode },
        'Chart types endpoint should be called with expected params'
      );
      let body = {
        data: [
          {
            type: 'chart-types',
            id: '1',
            attributes: {
              name: 'Chart Type 1',
            },
          },
          {
            type: 'chart-types',
            id: '2',
            attributes: {
              name: 'Chart Type 2',
            },
          },
        ],
      };
      return [200, {}, JSON.stringify(body)];
    });

    await visit(`/games/${this.game.shortCode}/chart-types`);

    assert.notStrictEqual(
      this.element.innerHTML.indexOf('Chart Type 1'),
      -1,
      'Page should have Chart Type 1'
    );
    assert.notStrictEqual(
      this.element.innerHTML.indexOf('Chart Type 2'),
      -1,
      'Page should have Chart Type 2'
    );
  });
});
