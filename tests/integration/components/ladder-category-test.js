import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DummyModel } from '../../utils/models';

module('Integration | Component | ladder-category', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // Without setupRouter(), LinkTo nodes won't have an href attribute
    // in tests. https://stackoverflow.com/questions/32130798/
    // eslint-disable-next-line ember/no-private-routing-service
    this.owner.lookup('router:main').setupRouter();

    let L1 = new DummyModel({ id: '1', name: 'L1', filterSpec: '' });
    let L2 = new DummyModel({ id: '2', name: 'L2', filterSpec: '' });

    // Set template property
    this.set('ladders', [L1, L2]);
    this.set('ladderFilterObjs', []);
    this.set('deleteLadder', () => {});
  });

  test('ladder details should render as expected', async function (assert) {
    assert.expect(4);

    await render(hbs`<LadderCategory
                       @ladders={{this.ladders}}
                       @ladderFilterObjs={{this.ladderFilterObjs}}
                       @deleteLadder={{this.deleteLadder}} />`);

    let ladderRows = this.element.querySelectorAll(
      'table.ladders > tbody > tr'
    );

    let assertLadderDetails = function (ladderRow, expectedName, expectedHref) {
      let cells = ladderRow.querySelectorAll('td');
      let anchor = cells[0].querySelector('a');
      let name = anchor.textContent.trim();
      let href = anchor.getAttribute('href');
      assert.equal(name, expectedName);
      assert.equal(href, expectedHref);
    };

    assertLadderDetails(ladderRows[0], 'L1', '/ladders/1');
    assertLadderDetails(ladderRows[1], 'L2', '/ladders/2');
  });
});
