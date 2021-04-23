import EmberObject, { action } from '@ember/object';
import Component from '@glimmer/component';

export default class FilterSelectComponent extends Component {

  get params() {
    let filterGroup = this.args.filterGroup;
    if (!filterGroup) {
      // This signals to data-power-select that we don't want a search to
      // take place.
      return null;
    }
    let params = EmberObject.create();
    params.set('filter_group_id', filterGroup.get('id'));
    params.set('usage_type', this.args.filterUsageType);
    return params;
  }
}
