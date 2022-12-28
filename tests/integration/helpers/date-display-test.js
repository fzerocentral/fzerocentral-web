import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | date-display', function (hooks) {
  setupRenderingTest(hooks);

  test('should render datetime format', async function (assert) {
    this.set('date', new Date('2003-07-25T00:00+00:00'));

    await render(hbs`{{date-display this.date 'datetime'}}`);

    // Exact display depends on client timezone.
    let datetimeRegex = /2003-07-2\d \d\d:\d\d/;
    let timezoneRegex = /[+-]\d\d:\d\d/;
    assert.ok(
      this.element.textContent.match(datetimeRegex),
      'Display should use the datetime format'
    );
    assert.notOk(
      this.element.textContent.match(timezoneRegex),
      'Display should not have a timezone'
    );
  });

  test('should render timezone format', async function (assert) {
    this.set('date', new Date('2003-07-25T00:00+00:00'));

    await render(hbs`{{date-display this.date 'timezone'}}`);

    // Exact display depends on client timezone.
    let regex = /2003-07-2\d \d\d:\d\d[+-]\d\d:\d\d/;
    assert.ok(
      this.element.textContent.match(regex),
      'Display should use the timezone format'
    );
  });
});
