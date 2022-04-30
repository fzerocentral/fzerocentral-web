import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { createModelInstance } from 'fzerocentral-web/tests/helpers/model-helpers';
import { assertPowerSelectOptionsEqual } from 'fzerocentral-web/tests/helpers/power-select-helpers';

module('Unit | Route | games/ladder-new', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(this.server, 'game', { name: 'Game 1' });
    let otherGame = createModelInstance(this.server, 'game', {
      name: 'Other Game',
    });

    createModelInstance(this.server, 'chart-group', {
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
  });

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:games/ladder-new');
    assert.ok(route);
  });

  test('limits chart group choices to the current game', async function (assert) {
    await visit(`/games/${this.game.id}/ladder-new`);

    let select = this.element.querySelector(
      'div.chart-group-select > .ember-power-select-trigger'
    );
    await assertPowerSelectOptionsEqual(
      assert,
      select,
      ['Chart Group 1', 'Chart Group 2'],
      'Choices should be as expected'
    );
  });

  test('can create new ladder', async function (assert) {
    await visit(`/games/${this.game.id}/ladder-new`);

    // Fill fields.
    fillIn('.name-input', 'New Ladder');
    await selectChoose('div.kind-select > .ember-power-select-trigger', 'side');
    fillIn('.filter-spec-input', '2-3n');
    await selectChoose(
      `div.chart-group-select > .ember-power-select-trigger`,
      'Chart Group 2'
    );
    // Submit form.
    await click('button[type=submit]');

    // Should redirect to the game's manage-ladders page
    assert.equal(
      currentURL(),
      `/games/${this.game.id}/ladders`,
      'Should redirect to ladder manage page after ladder creation'
    );

    // Check that the ladder was indeed saved to the API database
    // with the expected values.
    let ladders = run(() => this.store.findAll('ladder'));
    let ladder = ladders.objectAt(0);

    assert.equal(
      ladder.get('name'),
      'New Ladder',
      'Should save the expected name'
    );
    assert.equal(ladder.get('kind'), 'side', 'Should save the expected kind');
    assert.equal(
      ladder.get('filterSpec'),
      '2-3n',
      'Should save the expected filterSpec'
    );
    assert.equal(
      ladder.get('chartGroup').get('id'),
      this.chartGroup2.id,
      'Should save the expected chartGroup'
    );
  });
});
