import { helper } from '@ember/component/helper';

// `link` is a filterImplicationLink which has `filter` on one side of the
// link. This function returns a string display representing the link from
// `filter`'s perspective.
export function linkDeleteOptionDisplay(params) {
  let [link, filter] = params;

  if (link.get('implyingFilter').get('id') === filter.get('id')) {
    return `to ${link.get('impliedFilter').get('name')}`;
  }
  else if (link.get('impliedFilter').get('id') === filter.get('id')) {
    return `from ${link.get('implyingFilter').get('name')}`;
  }
  else {
    // link doesn't have filter; incorrect usage.
    return '-';
  }
}

export default helper(linkDeleteOptionDisplay);
