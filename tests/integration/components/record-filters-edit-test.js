import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, select } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { DummyModel } from '../../utils/models';
import { FilterSelectControl } from '../../../utils/filter-select';
import { assertSelectOptionsEqual } from '../../utils/html';

module('Integration | Component | record-filters-edit', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let g1 = new DummyModel({ id: '1', name: 'G1' });
    let g2 = new DummyModel({ id: '2', name: 'G2' });
    this.f1 = new DummyModel({ id: '1', name: 'F1', filterGroup: g1 });
    let f2 = new DummyModel({ id: '2', name: 'F2', filterGroup: g1 });
    let f3 = new DummyModel({ id: '3', name: 'F3', filterGroup: g2 });
    this.f4 = new DummyModel({ id: '4', name: 'F4', filterGroup: g2 });

    this.set('filterGroups', [g1, g2]);
    let filterSelects = {
      1: new FilterSelectControl('filter-1', () => {
        return new Promise((resolve) => {
          resolve([this.f1, f2]);
        });
      }),
      2: new FilterSelectControl('filter-2', () => {
        return new Promise((resolve) => {
          resolve([f3, this.f4]);
        });
      }),
    };
    this.set('filterSelects', filterSelects);
  });

  // Skip: awaiting initializeOptions() before asserting the select options
  // isn't enough, we also have to somehow await Ember's rendering of the
  // select options in the DOM.
  test.skip('should set filter options', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <form id='test-form'>
        <RecordFiltersEdit
          @filterGroups={{this.filterGroups}}
          @filterSelectControlInstances={{this.filterSelects}} />
      </form>
    `);
    await this.filterSelects['1'].initializeOptions();
    await this.filterSelects['2'].initializeOptions();

    let selectElements = [
      this.element.querySelector('#filter-1-select'),
      this.element.querySelector('#filter-2-select'),
    ];

    assertSelectOptionsEqual(
      assert,
      selectElements[0],
      [
        ['1', 'F1'],
        ['2', 'F2'],
      ],
      "First group's options should be as expected"
    );

    assertSelectOptionsEqual(
      assert,
      selectElements[1],
      [
        ['3', 'F3'],
        ['4', 'F4'],
      ],
      "Second group's options should be as expected"
    );
  });

  test('should be able to choose filters for each group', async function (assert) {
    await render(hbs`
      <form id='test-form'>
        <RecordFiltersEdit
          @filterGroups={{this.filterGroups}}
          @filterSelectControlInstances={{this.filterSelects}} />
      </form>
    `);
    await this.filterSelects['1'].initializeOptions();
    await this.filterSelects['2'].initializeOptions();

    let selectElements = [
      this.element.querySelector('#filter-1-select'),
      this.element.querySelector('#filter-2-select'),
    ];

    await select(selectElements[0], '1');
    assert.equal(
      this.filterSelects['1'].selectedFilterId,
      '1',
      'First filter selection should update state'
    );

    await select(selectElements[1], '4');
    assert.equal(
      this.filterSelects['2'].selectedFilterId,
      '4',
      'Second filter selection should update state'
    );
  });
});
