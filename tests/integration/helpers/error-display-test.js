import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | error-display', function(hooks) {
  setupRenderingTest(hooks);

  test('null error should be tolerated', async function(assert) {
    this.set('error', null);

    await render(hbs`{{error-display error}}`);

    assert.dom(this.element).hasText('');
  });

  test('string error should be rendered properly', async function(assert) {
    this.set('error', "Error detail goes here");

    await render(hbs`{{error-display error}}`);

    assert.dom(this.element).hasText('Error detail goes here');
  });

  test('error without source should be rendered properly', async function(assert) {
    this.set('error', {detail: "Error detail goes here"});

    await render(hbs`{{error-display error}}`);

    assert.dom(this.element).hasText('Error detail goes here');
  });

  test('error with base source pointer should be rendered properly', async function(assert) {
    this.set(
      'error', {
        source: {pointer: '/data/attributes/base'},
        detail: "Error detail goes here"});

    await render(hbs`{{error-display error}}`);

    assert.dom(this.element).hasText('Error detail goes here');
  });

  test('error with non-base source pointer should be rendered properly', async function(assert) {
    this.set(
      'error', {
        source: {pointer: '/data/attributes/usage-type'},
        detail: "is required"});

    await render(hbs`{{error-display error}}`);

    assert.dom(this.element).hasText('Usage type is required');
  });
});
