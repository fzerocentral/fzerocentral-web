export const Modifier = {
  Equal: {code: '', display: ''},
  NotEqual: {code: 'n', display: 'NOT'},
  GreaterOrEqual: {code: 'ge', display: '>='},
  LessOrEqual: {code: 'le', display: '<='},
};


function modifierFromStr(str) {
  for (let item of Object.values(Modifier)) {
    if (item.code === str) {
      return item;
    }
  }
  return null;
}


function specItemFromString(specItemStr) {
  let regexMatch = /([0-9]+)([a-zA-Z]*)/.exec(specItemStr);
  if (regexMatch === null) {
    // String is invalid
    return null;
  }

  return {
    filterId: regexMatch[1],
    modifier: modifierFromStr(regexMatch[2]),
  };
}


function specItemToString(specItem) {
  return `${specItem.filterId}${specItem.modifier.code}`;
}


function specItemToDisplay(specItem, filterInstances) {
  if (specItem === null) {return '';}

  let filterObj = filterInstances.find(
    f => f.get('id') === specItem.filterId);
  // Perhaps a property update still has to happen.
  if (!filterObj) {return '';}

  let filterName = filterObj.get('name');
  let filterGroupName = filterObj.get('filterGroup').get('name');
  return `${filterGroupName}: ${specItem.modifier.display} ${filterName}`;
}


function filterSpecStrToItems(specStr) {
  if (specStr === null) {
    return [];
  }

  let specItemStrs = specStr.split('-');
  return specItemStrs.map(specItemFromString);
}


function filterSpecItemsToStr(specItems) {
  let specItemStrs = specItems.map(specItemToString);
  if (specItemStrs.includes(null)) {
    // Invalid item
    return null;
  }
  if (specItemStrs.length === 0) {
    // 0 items
    return null;
  }
  return specItemStrs.join('-');
}


export function addFilterSpecItem(specStr, filterId, modifierStr) {
  let specItems = filterSpecStrToItems(specStr);
  specItems.push({
    filterId: filterId,
    modifier: modifierFromStr(modifierStr),
  });
  return filterSpecItemsToStr(specItems);
}


export function removeFilterSpecItem(specStr, index) {
  let specItems = filterSpecStrToItems(specStr);
  // Remove 1 element at the specified index.
  specItems.splice(index, 1);
  return filterSpecItemsToStr(specItems);
}


export function filterSpecStrToDisplays(specStr, filterInstances) {
  let specItems = filterSpecStrToItems(specStr);
  let displays = [];
  for (let specItem of specItems) {
    displays.push(specItemToDisplay(specItem, filterInstances));
  }
  return displays;
}
