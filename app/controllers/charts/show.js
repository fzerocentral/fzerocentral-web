import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';


export default class ChartsShowController extends Controller {
  queryParams = [{
    // On the Ember side this is `appliedFiltersString`; going out to the API
    // side we'll use `filters`.
    appliedFiltersString: 'filters'
  }];
  appliedFiltersString = null;

  @tracked showAllFilterGroups = null;

  constructor(...args) {
    super(...args);

    this.boundGetFilterOptions = this.getFilterOptions.bind(this);
  }

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.model.filterGroups;
    }
    else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  }

  getFilterOptions(filterGroupId, searchText) {
    return this.store.query('filter', {
      filter_group_id: filterGroupId,
      name_search: searchText,
    })
  }
}
