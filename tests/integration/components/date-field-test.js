import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | date-field', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(
      hbs`<DateField
            @fieldId='date-achieved' />`
    );

    let input = this.element.querySelector('input#date-achieved');
    assert.ok(input, 'Should render the input element');
  });

  test('should show an initial value', async function (assert) {
    this.set('dateValue', new Date('2003-07-25T00:00+00:00'));
    await render(
      hbs`<DateField
            @fieldId='date-achieved'
            @initialDateValue={{this.dateValue}} />`
    );

    let dateDisplay = this.element.textContent.trim();
    assert.ok(
      // Exact display depends on client timezone.
      dateDisplay.startsWith('2003-07-2'),
      'Should show an initial value (not checking exact display)'
    );
  });

  test('filling the field should update the date display', async function (assert) {
    this.set('updateDateValue', (value) => {
      this.dateValue = value;
    });
    await render(
      hbs`<DateField
            @fieldId='date-achieved'
            @updateDateValue={{this.updateDateValue}} />`
    );

    // `await` ensures that the `change` handler gets to run before we move on
    // to the next line of this test.
    await fillIn('#date-achieved', '2003-07-25');

    let dateDisplay = this.element.textContent.trim();
    assert.ok(
      // Exact display depends on client timezone.
      dateDisplay.startsWith('2003-07-2'),
      'Should show an initial value (not checking exact display)'
    );
  });
});
