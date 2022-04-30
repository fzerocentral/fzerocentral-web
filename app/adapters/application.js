import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { pluralize } from 'ember-inflector';
import { underscore } from '@ember/string';
import ENV from 'fzerocentral-web/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  namespace = ENV.APP.apiNamespace;

  // API uses URL paths that end with a slash. Note that this function
  // deals with URL paths, without the domain, query args, or fragment.
  buildURL(...args) {
    let urlPath = super.buildURL(...args);

    if (!urlPath.endsWith('/')) {
      urlPath += '/';
    }

    return urlPath;
  }

  // API uses resource URLs like chart_groups/1/, where chart_groups is plural.
  pathForType(type) {
    return pluralize(underscore(type));
  }
}
