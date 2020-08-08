import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | date-field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('dateValue', null);
    await render(hbs`<DateField @dateValue={{dateValue}} />`);

    assert.dom(this.element).hasText('');
  });

  test('filling the field updates dateValue', async function(assert) {
    this.set('dateValue', null);
    await render(hbs`<DateField @dateValue={{dateValue}} />`);

    // `await` ensures that the `change` handler gets to run before we move on
    // to the next line of this test.
    await fillIn('.date-input', '2018-10-16');

    // Just check that it's a date.
    // The exact date will depend on the client timezone; not sure how to
    // make an assert account for that.
    assert.equal(this.dateValue.constructor.name, 'Date');
  });
});
