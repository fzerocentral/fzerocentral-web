import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, select } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { FilterSelectControl } from '../../../utils/filter-select';
import { assertSelectOptionsEqual } from '../../utils/html';
import { DummyModel } from '../../utils/models';

module('Integration | Component | filter-select', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    let g = new DummyModel({ id: '1', name: 'G', kind: 'select' });
    let f1 = new DummyModel({ id: '1', name: 'F1', filterGroup: g });
    let f2 = new DummyModel({ id: '2', name: 'F2', filterGroup: g });

    function getFilterOptions() {
      return new Promise((resolve) => {
        resolve([f1, f2]);
      });
    }
    this.set('controlInstance', new FilterSelectControl(getFilterOptions));
  });

  test('should have expected options', async function (assert) {
    assert.expect(1);

    await render(hbs`
      <form id='test-form'>
        <FilterSelect
          @baseFieldName='filter'
          @label='G'
          @control={{this.controlInstance}} />
      </form>
    `);
    await this.controlInstance.initializeOptions();

    let selectElement = this.element.querySelector('select');
    assertSelectOptionsEqual(
      assert,
      selectElement,
      [
        ['1', 'F1'],
        ['2', 'F2'],
      ],
      'Options should be as expected'
    );
  });

  test('should change filter', async function (assert) {
    await render(hbs`
      <form id='test-form'>
        <FilterSelect
          @baseFieldName='filter'
          @label='G'
          @control={{this.controlInstance}} />
      </form>
    `);
    await this.controlInstance.initializeOptions();

    let selectElement = this.element.querySelector('select');
    await select(selectElement, '1');

    assert.strictEqual(
      selectElement.value,
      '1',
      'Dropdown should have the right filter'
    );
    assert.strictEqual(
      this.controlInstance.selectedFilterId,
      '1',
      'Control instance should have the right filter'
    );
  });
});
