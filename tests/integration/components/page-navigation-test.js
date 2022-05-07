import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

function createPageResults(metaPagination) {
  return { meta: { pagination: metaPagination } };
}

function normalizeHTMLTextContent(text) {
  // Collapse consecutive whitespace characters into a single space. Trim
  // leading/trailing spaces from the result.
  return text.replace(/\s+/g, ' ').trim();
}

module('Integration | Component | page-navigation', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('pageNumber', null);
    this.set('updatePageNumber', (value) => {
      this.set('pageNumber', value);
    });
  });

  test('should render nothing with zero results', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 0,
        pages: 1,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    assert.dom(this.element).hasText('', 'Should render nothing');
  });

  test('should render nothing with only one page', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 9,
        pages: 1,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    assert.dom(this.element).hasText('', 'Should render nothing');
  });

  test('should render page 1 of 2 properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 12,
        pages: 2,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2',
      'Page link text should be as expected'
    );

    let resultsCountDiv = this.element.querySelector('div.page-results-counts');
    assert
      .dom(resultsCountDiv)
      .hasText('12 results', 'Results count display should be correct');
  });

  test('should render page 2 of 2 properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 12,
        pages: 2,
        page: 2,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2',
      'Page link text should be as expected'
    );
  });

  test('should render page 1 of 3 properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 30,
        pages: 3,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2 3',
      'Page link text should be as expected'
    );
  });

  test('should render page 2 of 3 properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 30,
        pages: 3,
        page: 2,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2 3',
      'Page link text should be as expected'
    );
  });

  test('should render page 3 of 3 properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 30,
        pages: 3,
        page: 3,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2 3',
      'Page link text should be as expected'
    );
  });

  test('should render the first page of many properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 2 ... 10',
      'Page link text should be as expected'
    );
  });

  test('should render a middle page of many properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 5,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 ... 4 5 6 ... 10',
      'Page link text should be as expected'
    );
  });

  test('should render the last page of many properly', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 10,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    let pageLinksDiv = this.element.querySelector('div.page-links');
    assert.equal(
      normalizeHTMLTextContent(pageLinksDiv.textContent),
      'Page 1 ... 9 10',
      'Page link text should be as expected'
    );
  });

  test('next page button should switch to the correct page', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 1,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    // There should be page buttons to pages 2 and 10. Click the first one.
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[0]);
    assert.equal(this.pageNumber, 2, 'Should have changed to the correct page');
  });

  test('last page button should switch to the correct page', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 2,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    // There should be page buttons to pages 1, 3, and 10. Click the last one.
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[2]);
    assert.equal(
      this.pageNumber,
      10,
      'Should have changed to the correct page'
    );
  });

  test('prev page button should switch to the correct page', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 10,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    // There should be page buttons to pages 1 and 9. Click the second one.
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[1]);
    assert.equal(this.pageNumber, 9, 'Should have changed to the correct page');
  });

  test('first page button should switch to the correct page', async function (assert) {
    this.set(
      'pageResults',
      createPageResults({
        count: 95,
        pages: 10,
        page: 9,
      })
    );

    await render(hbs`
      <PageNavigation
        @pageResults={{this.pageResults}}
        @updatePageNumber={{this.updatePageNumber}} />
    `);

    // There should be page buttons to pages 1, 8, and 10. Click the first one.
    let buttons = this.element.querySelectorAll('button');
    await click(buttons[0]);
    assert.equal(this.pageNumber, 1, 'Should have changed to the correct page');
  });
});
