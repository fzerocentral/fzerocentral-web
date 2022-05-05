import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import fetchMock from 'fetch-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { click, fillIn, select, visit } from '@ember/test-helpers';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | filter-groups/filter-new', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.router = this.owner.lookup('service:router');
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:filter-groups/filter-new');
    assert.ok(route);
  });

  test('can create a new filter', async function (assert) {
    assert.expect(1);

    let filterGroup = createModelInstance(this.server, 'filter-group', {
      name: 'Machine',
      kind: 'select',
      showByDefault: true,
      game: this.game,
      orderInGame: 1,
    });

    await visit(`/filter-groups/${filterGroup.id}/filter-new`);

    await fillIn('input[name="name"]', 'Non-Custom');
    await select('#usage-type-field', 'implied');

    fetchMock.post({ url: 'path:/filters/' }, (url, options) => {
      assert.deepEqual(
        JSON.parse(options.body).data,
        {
          type: 'filters',
          attributes: {
            name: 'Non-Custom',
            usageType: 'implied',
          },
          relationships: {
            'filter-group': {
              data: {
                type: 'filter-groups',
                id: filterGroup.id,
              },
            },
          },
        },
        'POST data should be as expected'
      );
      return Response(null, { status: 201 });
    });

    await click('#create-filter-form button');
    // TODO: Gets error `this is undefined` when trying to create the filter; don't know why.
    // assert.equal(
    //   currentURL(),
    //   `/filter-groups/${filterGroup.id}`,
    //   'Should redirect to filter group page'
    // );
  });

  test('can create a new numeric filter', async function (assert) {
    assert.expect(1);

    let filterGroup = createModelInstance(this.server, 'filter-group', {
      name: 'Setting',
      kind: 'numeric',
      showByDefault: true,
      game: this.game,
      orderInGame: 1,
    });

    await visit(`/filter-groups/${filterGroup.id}/filter-new`);

    await fillIn('input[name="name"]', '65%');
    await fillIn('input[name="numeric-value"]', '65');

    fetchMock.post({ url: 'path:/filters/' }, (url, options) => {
      assert.deepEqual(
        JSON.parse(options.body).data,
        {
          type: 'filters',
          attributes: {
            name: '65%',
            numericValue: '65',
          },
          relationships: {
            'filter-group': {
              data: {
                type: 'filter-groups',
                id: filterGroup.id,
              },
            },
          },
        },
        'POST data should be as expected'
      );
      return Response(null, { status: 204 });
    });

    await click('#create-filter-form button');
    // TODO: Gets error `this is undefined` when trying to create the filter; don't know why.
    // assert.equal(
    //   currentURL(),
    //   `/filter-groups/${filterGroup.id}`,
    //   'Should redirect to filter group page'
    // );
  });
});
