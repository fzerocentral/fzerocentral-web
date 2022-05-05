export function assertSelectOptionsEqual(
  assert,
  selectElement,
  expectedOptions,
  assertMessage
) {
  let options = selectElement.querySelectorAll('option');
  let optionValuesDisplays = Array.from(options).map((option) => [
    option.value,
    option.textContent.trim(),
  ]);
  assert.deepEqual(optionValuesDisplays, expectedOptions, assertMessage);
}
