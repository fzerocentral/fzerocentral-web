import { click } from '@ember/test-helpers';

export async function assertPowerSelectOptionsEqual(
    assert, powerSelectElement, expectedOptions, assertMessage) {
  // Note: This function has to click the power select trigger, and may thus
  // interfere with interactivity on other elements.
  //
  // To check a power-select's options in the HTML, we have to first click
  // the power-select to make the dropdown appear, then we have to check
  // the ember-basic-dropdown-wormhole for the element indicated by the
  // power-select's aria-owns attribute.
  await click(`#${powerSelectElement.id}`);
  let dropdownContentId = powerSelectElement.getAttribute('aria-owns');
  let dropdownContent = document.getElementById(dropdownContentId);
  let optionsList =
    dropdownContent.querySelector('ul.ember-power-select-options');
  let optionTexts =
    Array.from(optionsList.querySelectorAll('li'))
    .map(element => element.textContent.trim());
  assert.deepEqual(optionTexts, expectedOptions, assertMessage);
}

export function assertPowerSelectCurrentTextEqual(
    assert, powerSelectElement, expectedText, assertMessage) {
  // The first span within `.ember-power-select-trigger` should contain
  // either the placeholder text or the selection text, while not containing
  // the little x which lets you clear the selection.
  assert.equal(
    powerSelectElement
      .querySelector(`span:first-child`)
      .textContent.trim(),
    expectedText,
    assertMessage);
}
