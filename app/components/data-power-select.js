import PowerSelect from 'ember-power-select/components/power-select';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object'

// This component is from: https://github.com/IliasDeros/ember-data-power-select
// It's simply copy-pasted into our project rather than installed, because it's
// simple enough to do that (well, and adding layoutName seems necessary for
// template inheritance.)
export default PowerSelect.extend({
  // Ensure that PowerSelect's template is used for this component,
  // thus eliminating the need to copy-paste it into our own template.
  layoutName: 'ember-power-select/components/power-select',

  store: service(),

  search: computed(function(){
    return term => {
      const { modelName, params, queryKey = 'search', store } =
        this.getProperties('modelName', 'params', 'queryKey', 'store')

      const query = Object.assign({}, params)
      query[queryKey] = term

      return store.query(modelName, query)
    };
  }),

  actions: {
    onTriggerFocus(){
      this._super(...arguments)
      this._performSearch('')
    }
  }
});
