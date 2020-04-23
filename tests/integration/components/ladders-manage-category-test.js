import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { startMirage } from 'fzerocentral-web/initializers/ember-cli-mirage';
import { createModelInstance, modelAsProperty }
  from 'fzerocentral-web/tests/helpers/model-helpers';


module('Integration | Component | ladders-manage-category', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.server = startMirage();
    this.store = this.owner.lookup('service:store');

    // Without setupRouter(), link-to nodes won't have an href attribute
    // in tests. https://stackoverflow.com/questions/32130798/
    this.owner.lookup('router:main').setupRouter();

    // Create ladders out of order, to ensure that display order doesn't
    // depend on creation order.
    this.ladder2 = createModelInstance(
      this.server, 'ladder', {orderInGameAndKind: 2, name: 'Ladder 2 name'});
    this.ladder1 = createModelInstance(
      this.server, 'ladder', {orderInGameAndKind: 1, name: 'Ladder 1 name'});
    this.ladder3 = createModelInstance(
      this.server, 'ladder', {orderInGameAndKind: 3, name: 'Ladder 3 name'});

    // Set template property
    this.set(
      'ladders',
      A([
        modelAsProperty(this.store, 'ladder', this.ladder1),
        modelAsProperty(this.store, 'ladder', this.ladder2),
        modelAsProperty(this.store, 'ladder', this.ladder3),
      ]));
  });

  hooks.afterEach( function() {
    this.server.shutdown();
  });

  test('ladder details should render as expected', async function(assert) {
    await render(hbs`<LaddersManageCategory @ladders={{ladders}} />`);

    let ladderRows = this.element.querySelectorAll(
      'table.ladders > tbody > tr');

    let assertLadderDetails = function(
        ladderRow, expectedOrder, expectedName) {
      let cells = ladderRow.querySelectorAll('td');
      let order = cells[0].querySelector('input').value;
      let anchor = cells[1].querySelector('a');
      let name = anchor.textContent.trim();
      assert.equal(order, expectedOrder);
      assert.equal(name, expectedName);
      // TODO: href gets an undefined ladder id for whatever reason.
      //let href = anchor.getAttribute('href');
      //assert.equal(href, expectedHref);
    };

    assertLadderDetails(
      ladderRows[0], '1', 'Ladder 1 name');
    assertLadderDetails(
      ladderRows[1], '2', 'Ladder 2 name');
    assertLadderDetails(
      ladderRows[2], '3', 'Ladder 3 name');
  });

  // Trying to test changing the ladder order encounters the error
  // `ladder.save is not a function`. Testing this in the route doesn't
  // get the error, so we test in the route instead.
});
