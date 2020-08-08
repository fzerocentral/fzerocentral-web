import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DS from "ember-data";


function createPageResults(metaPagination) {
  return DS.PromiseObject.create({
    promise: Promise.resolve().then(() => {
      return {'meta': {'pagination': metaPagination}};
    })
  });
}


function normalizeHTMLTextContent(text) {
  // Collapse consecutive whitespace characters into a single space. Trim
  // leading/trailing spaces from the result.
  return text.replace(/\s+/g, ' ').trim();
}


module('Integration | Component | page-navigation', function(hooks) {
  setupRenderingTest(hooks);

  test('should render properly with only one page', async function(assert) {
    // pageResults needs to be a PromiseObject - to match the expectations of
    // the has-multiple-pages component, for example. But for this test, we
    // don't have to wait for anything to resolve, so we use Promise.resolve()
    // to create an already-resolved promise.
    this.set('pageResults', createPageResults({
      totalResults: 9,
      resultsPerPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=1 />
    `);

    assert.dom(this.element).hasText('', "Should render nothing");
  });

  test('should render page 1 of 2 properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 12,
      resultsPerPage: 10,
      lastPage: 2,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=1 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('1-10 of 12', "Results count display should be correct");
  });

  test('should render page 2 of 2 properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 12,
      resultsPerPage: 10,
      firstPage: 1,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=2 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('11-12 of 12', "Results count display should be correct");
  });

  test('should render page 1 of 3 properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 30,
      resultsPerPage: 10,
      nextPage: 2,
      lastPage: 3,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=1 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 3",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('1-10 of 30', "Results count display should be correct");
  });

  test('should render page 2 of 3 properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 30,
      resultsPerPage: 10,
      firstPage: 1,
      lastPage: 3,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=2 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 3",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('11-20 of 30', "Results count display should be correct");
  });

  test('should render page 3 of 3 properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 30,
      resultsPerPage: 10,
      firstPage: 1,
      prevPage: 2,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=3 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 3",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('21-30 of 30', "Results count display should be correct");
  });

  test('should render the first page of many properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      nextPage: 2,
      lastPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=1 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 ... 10",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('1-10 of 95', "Results count display should be correct");
  });

  test('should render a middle page of many properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      firstPage: 1,
      prevPage: 4,
      nextPage: 6,
      lastPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=5 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      "Page 1 ... 4 5 6 ... 10",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('41-50 of 95', "Results count display should be correct");
  });

  test('should render the last page of many properly', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      firstPage: 1,
      prevPage: 9,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=10 />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 ... 9 10",
      "Page link text should be as expected");

    let resultsCountDiv = this.element.querySelector(
      'div.page-results-counts');
    assert.dom(resultsCountDiv).hasText('91-95 of 95', "Results count display should be correct");
  });

  test('next page button should switch to the correct page', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      nextPage: 2,
      lastPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=1 />
    `);

    // There should be page buttons to pages 2 and 10
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[0]);
    // The current page number should've changed from 1 to 2. The rest of the
    // elements stay the same, since due to the limited scope of this test, we
    // didn't actually trigger a change in the pageResults.
    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 ... 10",
      "Should have changed to the correct page");
  });

  test('last page button should switch to the correct page', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      firstPage: 1,
      nextPage: 3,
      lastPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=2 />
    `);

    // There should be page buttons to pages 1, 3, and 10
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[2]);
    // The current page number should've changed from 2 to 10.
    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 2 3 ... 10",
      "Should have changed to the correct page");
  });

  test('prev page button should switch to the correct page', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      firstPage: 1,
      prevPage: 9,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=10 />
    `);
    // There should be page buttons to pages 1 and 9
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[1]);
    // The current page number should've changed from 10 to 9.
    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 ... 9 10",
      "Should have changed to the correct page");
  });

  test('first page button should switch to the correct page', async function(assert) {
    this.set('pageResults', createPageResults({
      totalResults: 95,
      resultsPerPage: 10,
      firstPage: 1,
      prevPage: 8,
      lastPage: 10,
    }));

    await render(hbs`
      <PageNavigation @pageResults={{pageResults}} @pageNumber=9 />
    `);
    // There should be page buttons to pages 1, 8, and 10
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[0]);
    // The current page number should've changed from 9 to 1.
    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent), "Page 1 ... 8 9 10",
      "Should have changed to the correct page");
  });
});
