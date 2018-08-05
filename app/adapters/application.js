import DS from 'ember-data';
import { pluralize } from 'ember-inflector';
import { underscore } from '@ember/string';
import ENV from 'fzerocentral-web/config/environment';

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.apiNamespace,

  // Rails uses resource URLs like chart_groups/1
  pathForType(type) {
    return pluralize(underscore(type));
  }
});
