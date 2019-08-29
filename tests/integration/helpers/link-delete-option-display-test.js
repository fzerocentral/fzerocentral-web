import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | link-delete-option-display', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach( function() {
    this.filterA = EmberObject.create();
    this.filterA.set('id', 1);
    this.filterA.set('name', "Gallant Star-G4");
    this.filterB = EmberObject.create();
    this.filterB.set('id', 2);
    this.filterB.set('name', "Titan -G4 booster");
    this.filterC = EmberObject.create();
    this.filterC.set('id', 3);
    this.filterC.set('name', "Dread Hammer body");
    this.link = EmberObject.create();
    this.link.set('implyingFilter', this.filterA);
    this.link.set('impliedFilter', this.filterB);
  });

  test('should be able to display text for an outgoing link', async function(assert) {
    this.set('link', this.link);
    this.set('filter', this.filterA);

    await render(hbs`{{link-delete-option-display link filter}}`);

    assert.equal(
      this.element.textContent.trim(), 'to Titan -G4 booster',
      "Link display should be as expected");
  });

  test('should be able to display text for an incoming link', async function(assert) {
    this.set('link', this.link);
    this.set('filter', this.filterB);

    await render(hbs`{{link-delete-option-display link filter}}`);

    assert.equal(
      this.element.textContent.trim(), 'from Gallant Star-G4',
      "Link display should be as expected");
  });

  test('should tolerate having the filter not be in the link', async function(assert) {
    this.set('link', this.link);
    this.set('filter', this.filterC);

    await render(hbs`{{link-delete-option-display link filter}}`);

    assert.equal(
      this.element.textContent.trim(), '-',
      "Link display should be as expected");
  });
});
