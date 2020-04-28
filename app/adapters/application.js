import DS from 'ember-data';
import { pluralize } from 'ember-inflector';
import { underscore } from '@ember/string';
import ENV from 'fzerocentral-web/config/environment';

// Example: <http://localhost:4200/filters?page=2>; rel="last"
// - Possible spaces
// - URL between angle brackets (captured)
// - ; rel=
// - rel between quotes (captured)
// - Possible spaces
let linkAndRelRegex = /\s*<([^>]+)>; rel="([^"]+)"\s*/;

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.apiNamespace,

  // The API response headers may have some info that we want.
  // To access this info in routes, components, etc., we can set the
  // info to the payload's meta attribute.
  // Then for example, in a template, we could access
  // `{{ myCollection.meta.myAttr }}`, or in JS we could use
  // `this.get('myCollection.meta.myAttr')`.
  handleResponse(status, headers, payload) {
    let meta = {};

    // Links to other API endpoints.
    // Example:
    // <http://localhost:4200/filters?page=2>; rel="last", <http://localhost:4200/filters?page=2>; rel="next"
    //
    // (Note: headers is an Object, but it may have been created in such a way
    // that it doesn't have hasOwnProperty. Hence the use of call().)
    if (Object.prototype.hasOwnProperty.call(headers, 'link')) {
      let linksHash = {};
      // Here we're assuming that links won't have commas
      headers['link'].split(',').forEach((linkAndRel) => {
        let regexResult = linkAndRelRegex.exec(linkAndRel);
        let link = regexResult[1];
        let rel = regexResult[2];
        linksHash[rel] = link;
      });
      meta['links'] = linksHash;
    }

    // Pagination.
    if (Object.prototype.hasOwnProperty.call(headers, 'per-page')) {
      meta['pagination'] = {};

      meta['pagination']['resultsPerPage'] = headers['per-page'];

      // Results across all pages.
      meta['pagination']['totalResults'] = headers['total'];

      // firstPage, prevPage, nextPage, lastPage
      ['first', 'prev', 'next', 'last'].forEach((pageName) => {
        if (Object.prototype.hasOwnProperty.call(meta, 'links')
            && Object.prototype.hasOwnProperty.call(meta['links'], pageName)) {
          let pageUrl = new URL(meta['links'][pageName]);
          let page = (new URLSearchParams(pageUrl.search)).get('page');
          meta['pagination'][pageName + 'Page'] = page;
        }
      });
      // Remove prev or next if they're redundant
      if (meta['pagination']['firstPage'] === meta['pagination']['prevPage']) {
        delete meta['pagination']['prevPage'];
      }
      if (meta['pagination']['lastPage'] === meta['pagination']['nextPage']) {
        delete meta['pagination']['nextPage'];
      }
    }

    // payload might be undefined if we got a 204 No Content response
    if (!payload) {
      payload = {};
    }
    payload.meta = meta;

    // By default, this function hook just returns the json payload passed to
    // it. So we do that as well.
    return payload;
  },

  // Rails uses resource URLs like chart_groups/1
  pathForType(type) {
    return pluralize(underscore(type));
  }
});
