import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class ChartsShowController extends Controller {
  queryParams = [{
    // On the Ember side this is `appliedFiltersString`; going out to the API
    // side we'll use `filters`.
    appliedFiltersString: 'filters'
  }];
  appliedFiltersString = null;

  @tracked showAllFilterGroups = null;
  @tracked selectedFilterGroup = null;
  @tracked filterOptions = A([]);

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.model.filterGroups;
    }
    else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  }

  @action
  updateSelectedFilterGroup(newSelectedFilterGroup) {
    this.selectedFilterGroup = newSelectedFilterGroup;

    this.filterOptions = this.store.query('filter', {
      filter_group_id: newSelectedFilterGroup.id,
    })
  }

  @action
  onSearchTextChange(searchText) {
    this.filterOptions = this.store.query('filter', {
      filter_group_id: this.selectedFilterGroup.id,
      name_search: searchText,
    })
  }
}
