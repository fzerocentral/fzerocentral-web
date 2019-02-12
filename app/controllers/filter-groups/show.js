import Controller from '@ember/controller';
import DS from 'ember-data';
import { computed } from '@ember/object';

export default Controller.extend({
  chartTypes: computed('model', function() {
    let filterGroup = this.model.filterGroup;
    return DS.PromiseArray.create({
      promise: this.get('store').query(
        'chart-type', {filter_group_id: filterGroup.id})
    });
  })
});
