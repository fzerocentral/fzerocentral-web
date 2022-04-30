import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { click, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance } from 'fzerocentral-web/tests/helpers/model-helpers';

module('Unit | Route | ladders/show', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    this.chartGroup = createModelInstance(this.server, 'chart-group', {
      name: 'Group 1',
      game: this.game,
    });
  });

  hooks.afterEach(function () {
    this.server.shutdown();
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:ladders/show');
    assert.ok(route);
  });

  test('can delete a ladder', async function (assert) {
    // Automatically confirm any window confirmations.
    let confirmFalseStub = sinon.stub(window, 'confirm');
    confirmFalseStub.returns(true);

    let ladderToDelete = createModelInstance(this.server, 'ladder', {
      game: this.game,
      kind: 'main',
      chartGroup: this.chartGroup,
      orderInGameAndKind: 1,
      name: 'Main ladder',
      filterSpec: '2-3n',
    });

    await visit(`/ladders/${ladderToDelete.id}`);

    // Delete ladder.
    let deleteButton = this.element.querySelector('.delete-button');
    await click(deleteButton);

    let ladders = run(() => this.store.findAll('ladder'));
    let formerLadder = ladders.find((ladder) => {
      return ladder.get('name') === 'Main ladder';
    });
    // Note: If this assertion fails, it might fail with a
    // `this.get(...).internalModel is undefined` error instead of a regular
    // assertion error. No idea why.
    assert.notOk(formerLadder, 'Ladder should be deleted');
  });
});
