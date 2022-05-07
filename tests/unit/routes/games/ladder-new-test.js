import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, fillIn, select, visit } from '@ember/test-helpers';
import { assertSelectOptionsEqual } from '../../../utils/html';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | games/ladder-new', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.router = this.owner.lookup('service:router');
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    let otherGame = createModelInstance(this.server, 'game', {
      name: 'Other Game',
    });

    this.chartGroup1 = createModelInstance(this.server, 'chart-group', {
      game: this.game,
      name: 'Chart Group 1',
    });
    this.chartGroup2 = createModelInstance(this.server, 'chart-group', {
      game: this.game,
      name: 'Chart Group 2',
    });
    createModelInstance(this.server, 'chart-group', {
      game: otherGame,
      name: 'Other Chart Group',
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/ladder-new');
    assert.ok(route);
  });

  test('should limit chart group choices to the current game', async function (assert) {
    assert.expect(1);

    await visit(`/games/${this.game.id}/ladder-new`);

    let selectElement = this.element.querySelector('#chart-group-field');
    await assertSelectOptionsEqual(
      assert,
      selectElement,
      [
        [this.chartGroup1.id, 'Chart Group 1'],
        [this.chartGroup2.id, 'Chart Group 2'],
      ],
      'Choices should be as expected'
    );
  });

  test('should create new ladder', async function (assert) {
    assert.expect(1);

    await visit(`/games/${this.game.id}/ladder-new`);

    // Fill fields.
    fillIn('#ladder-name', 'New Ladder');
    await select('#kind-field', 'side');
    fillIn('#ladder-filter-spec', '2-3n');
    await select('#chart-group-field', this.chartGroup2.id);

    fetchMock.post({ url: 'path:/ladders/' }, (url, options) => {
      assert.deepEqual(
        JSON.parse(options.body).data,
        {
          type: 'ladders',
          attributes: {
            name: 'New Ladder',
            kind: 'side',
            'filter-spec': '2-3n',
          },
          relationships: {
            'chart-group': {
              data: {
                type: 'chart-groups',
                id: this.chartGroup2.id,
              },
            },
            game: {
              data: {
                type: 'games',
                id: this.game.id,
              },
            },
          },
        },
        'POST data should be as expected'
      );
      return Response(null, { status: 201 });
    });

    // Submit form.
    await click('#create-ladder-form button');
    // TODO: Gets error `this is undefined` when trying to create the ladder; don't know why.
    // assert.equal(
    //   currentURL(),
    //   `/games/${this.game.id}/ladders`,
    //   'Should redirect to ladder manage page after ladder creation'
    // );
  });
});
