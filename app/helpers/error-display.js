import { helper } from '@ember/component/helper';

/**
 * Takes EITHER:
 * - A JSON-API-compliant response body which has an error, or
 * - An error string.
 * Returns an appropriate error string.
 */
export function errorDisplay(params) {
  let [error] = params;
  if (error === null) { return null; }

  if (error.constructor === String) {
    // Error string
    return error;
  }

  // If we're here, we're assuming a JSON API response body
  let prefix = "";

  if (error.source) {
    let pointer = error.source.pointer;

    if (pointer.startsWith('/data/attributes/')) {
      // Pointer example: `/data/attributes/usage-type`
      let attributeName = pointer.substring('/data/attributes/'.length);

      if (attributeName !== 'base') {
        // 'base' means the error pertains to the resource as a whole rather
        // than a specific attribute/field.
        // Else, it does pertain to a specific attribute.

        // Dashes -> spaces
        let attributeDisplay = attributeName.replace(/-/g, ' ');
        // Capitalize first letter
        attributeDisplay = attributeDisplay.charAt(0).toUpperCase()
          + attributeDisplay.substring(1);
        prefix = attributeDisplay + " ";
      }
    }
  }

  return prefix + error.detail;
}

export default helper(errorDisplay);
