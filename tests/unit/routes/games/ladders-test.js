import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { fillIn, visit } from '@ember/test-helpers';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


module('Unit | Route | games/ladders', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(
      this.server, 'game', {name: 'Game 1'});
    this.otherGame = createModelInstance(
      this.server, 'game', {name: 'Other Game'});

    this.mainLadder = createModelInstance(
      this.server, 'ladder', {
        game: this.game, kind: 'main',
        orderInGameAndKind: 1, name: 'Main ladder'});
    createModelInstance(
      this.server, 'ladder', {
        game: this.game, kind: 'side',
        orderInGameAndKind: 1, name: 'Side ladder'});
    createModelInstance(
      this.server, 'ladder', {
        game: this.otherGame, kind: 'main',
        orderInGameAndKind: 1, name: 'Other game ladder'});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:games/ladders');
    assert.ok(route);
  });

  test('ladders are grouped by kind', async function(assert){
    await visit(`/games/${this.game.id}/ladders`);

    let getLadderNameFromRow = function(row) {
      let cells = row.querySelectorAll('td');
      let anchor = cells[1].querySelector('a');
      return anchor.textContent.trim();
    };

    // Main ladder table should only have main ladders from this game.
    // otherGameLadder shouldn't be present.
    let mainLadderRows = this.element.querySelectorAll(
      'div.main-ladders table.ladders > tbody > tr');
    assert.equal(mainLadderRows.length, 1);
    assert.equal(getLadderNameFromRow(mainLadderRows[0]), 'Main ladder');

    // Side ladder table should only have side ladders from this game.
    let sideLadderRows = this.element.querySelectorAll(
      'div.side-ladders table.ladders > tbody > tr');
    assert.equal(sideLadderRows.length, 1);
    assert.equal(getLadderNameFromRow(sideLadderRows[0]), 'Side ladder');
  });

  test('can change ladder order', async function(assert){
    await visit(`/games/${this.game.id}/ladders`);

    let getMainLadderOrderField = function(thisTest) {
      let mainLadderRows = thisTest.element.querySelectorAll(
        'div.main-ladders table.ladders > tbody > tr');
      return mainLadderRows[0].querySelector('.order-input');
    };

    await fillIn(getMainLadderOrderField(this), '4');

    this.mainLadder.reload();
    assert.equal(
      this.mainLadder.orderInGameAndKind, 4,
      'New value should be saved in the model');
    assert.equal(
      getMainLadderOrderField(this).value, '4',
      'Route should be refreshed, thus showing the new value');
  });
});
