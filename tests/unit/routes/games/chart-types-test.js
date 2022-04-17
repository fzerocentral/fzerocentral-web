import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { visit } from '@ember/test-helpers';
import { createModelInstance }
  from 'fzerocentral-web/tests/helpers/model-helpers';


module('Unit | Route | games/chart-types', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    this.game = createModelInstance(
      this.server, 'game', {name: 'Game 1'});
    let otherGame = createModelInstance(
      this.server, 'game', {name: 'Other Game'});

    createModelInstance(
      this.server, 'chart-type', {game: this.game, name: 'Chart Type 1'});
    createModelInstance(
      this.server, 'chart-type', {game: this.game, name: 'Chart Type 2'});
    createModelInstance(
      this.server, 'chart-type', {game: otherGame, name: 'Other Chart Type'});
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:games/chart-types');
    assert.ok(route);
  });

  test('lists chart types for the game', async function(assert){
    await visit(`/games/${this.game.id}/chart-types`);

    // Shouldn't contain the other game's chart type
    assert.ok(this.element.innerHTML.indexOf('Chart Type 1') !== -1);
    assert.ok(this.element.innerHTML.indexOf('Chart Type 2') !== -1);
    assert.ok(this.element.innerHTML.indexOf('Other Chart Type') === -1);
  });
});
