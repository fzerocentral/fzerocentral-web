import EmberObject from '@ember/object';
import Component from '@glimmer/component';


export default class RecordFiltersEditComponent extends Component {

  get filtersPerGroup() {
    let obj = EmberObject.create();
    // One object entry per filter group. Default to null.
    this.args.filterGroups.forEach((filterGroup) => {
      obj.set(filterGroup.id, null);
    });
    // Fill in entries based on contents of `filters`. There should be at most
    // one filter per filter group.
    this.args.filters.forEach((filter) => {
      // The API records response must include related-objects `filters`
      // in order for this to work.
      obj.set(filter.filterGroup.get('id'), filter);
    });
    return obj;
  }
}
