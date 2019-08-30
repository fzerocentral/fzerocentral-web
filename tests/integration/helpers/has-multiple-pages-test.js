import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DS from "ember-data";


function createPageResults(metaPagination) {
  return DS.PromiseObject.create({
    promise: Promise.resolve().then(() => {
      return {'meta': {'pagination': metaPagination}};
    })
  });
}


module('Integration | Helper | has-multiple-pages', function(hooks) {
  setupRenderingTest(hooks);

  test("tolerates page results without a meta attribute", async function(assert) {
    this.set('pageResults', DS.PromiseObject.create({
      promise: Promise.resolve().then(() => {return {};})
    }));

    await render(hbs`{{get (has-multiple-pages pageResults) "value"}}`);

    assert.equal(
      this.element.textContent.trim(), 'false', "Result should be false");
  });

  test("works with less than one page of results", async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 5,
      resultsPerPage: 10,
    }));

    await render(hbs`{{get (has-multiple-pages pageResults) "value"}}`);

    assert.equal(
      this.element.textContent.trim(), 'false', "Result should be false");
  });

  test("works with exactly one page of results", async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 10,
      resultsPerPage: 10,
    }));

    await render(hbs`{{get (has-multiple-pages pageResults) "value"}}`);

    assert.equal(
      this.element.textContent.trim(), 'false', "Result should be false");
  });

  test("works with multiple pages of results", async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 15,
      resultsPerPage: 10,
    }));

    await render(hbs`{{get (has-multiple-pages pageResults) "value"}}`);

    assert.equal(
      this.element.textContent.trim(), 'true', "Result should be true");
  });
});
