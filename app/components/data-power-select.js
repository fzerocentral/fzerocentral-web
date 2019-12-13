import { A } from '@ember/array';
import { action, computed } from '@ember/object'
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import PowerSelect from 'ember-power-select/components/power-select';

// This component is from:
// https://github.com/IliasDeros/ember-data-power-select
// It's copy-pasted (with modifications) into our project rather than
// installed, because it's a relatively simple component.
export default PowerSelect.extend({
  // Ensure that PowerSelect's template is used for this component, thus
  // eliminating the need to copy-paste the contents into our own template.
  layoutName: 'ember-power-select/components/power-select',

  store: service(),

  @computed()
  get search() {
    return term => {
      const { modelName, params, queryKey = 'search', store } =
        this.getProperties('modelName', 'params', 'queryKey', 'store');

      if (params === null) {
        // params may be set to null, signaling that we don't want a search
        // to take place.
        return DS.PromiseArray.create({
          promise: Promise.resolve().then(() => { return A([]); })
        });
      }

      const query = Object.assign({}, params);
      query[queryKey] = term;

      return store.query(modelName, query);
    };
  },

  @action
  handleTriggerFocus() {
    this._super(...arguments);
    this._performSearch('');
  }
});
