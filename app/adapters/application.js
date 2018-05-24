import DS from 'ember-data';
import ENV from 'fzerocentral-web/config/environment';

export default DS.JSONAPIAdapter.extend({
  namespace: ENV.APP.apiNamespace
});
