import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { click, visit } from '@ember/test-helpers';
import fetchMock from 'fetch-mock';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from '../../../utils/models';

module('Unit | Route | games/ladders-manage', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    this.otherGame = createModelInstance(this.server, 'game', {
      name: 'Other Game',
    });

    this.mainLadder = createModelInstance(this.server, 'ladder', {
      game: this.game,
      kind: 'main',
      orderInGameAndKind: 1,
      name: 'Main ladder',
    });
    createModelInstance(this.server, 'ladder', {
      game: this.game,
      kind: 'side',
      orderInGameAndKind: 1,
      name: 'Side ladder',
    });
    createModelInstance(this.server, 'ladder', {
      game: this.otherGame,
      kind: 'main',
      orderInGameAndKind: 1,
      name: 'Other game ladder',
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
    // Restore fetch() to its native implementation.
    fetchMock.reset();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/ladders-manage');
    assert.ok(route);
  });

  test('ladders should be grouped by kind', async function (assert) {
    await visit(`/games/${this.game.id}/ladders-manage`);

    let getLadderNameFromRow = function (row) {
      let cells = row.querySelectorAll('td');
      let anchor = cells[0].querySelector('a');
      return anchor.textContent.trim();
    };

    // Main ladder table should only have main ladders from this game.
    // otherGameLadder shouldn't be present.
    let mainLadderRows = this.element.querySelectorAll(
      'div.main-ladders table.ladders > tbody > tr'
    );
    assert.equal(mainLadderRows.length, 1, 'Should show 1 main ladder');
    assert.equal(
      getLadderNameFromRow(mainLadderRows[0]),
      'Main ladder',
      'Main ladder name should be as expected'
    );

    // Side ladder table should only have side ladders from this game.
    let sideLadderRows = this.element.querySelectorAll(
      'div.side-ladders table.ladders > tbody > tr'
    );
    assert.equal(sideLadderRows.length, 1, 'Should show 1 side ladder');
    assert.equal(
      getLadderNameFromRow(sideLadderRows[0]),
      'Side ladder',
      'Side ladder name should be as expected'
    );
  });

  test('should delete a ladder', async function (assert) {
    assert.expect(1);

    // Automatically confirm any window confirmations.
    let confirmFalseStub = sinon.stub(window, 'confirm');
    confirmFalseStub.returns(true);

    await visit(`/games/${this.game.id}/ladders-manage`);

    fetchMock.delete(
      { url: `path:/ladders/${this.mainLadder.id}/` },
      (url, options) => {
        assert.equal(
          JSON.parse(options.body).data,
          null,
          'DELETE data should be as expected'
        );
        return Response(null, { status: 204 });
      }
    );

    // Delete ladder.
    await click('div.main-ladders table.ladders button');
  });
});
