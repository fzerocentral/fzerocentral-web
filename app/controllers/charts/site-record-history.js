import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ChartsTopRecordHistoryController extends Controller {
  queryParams = ['ladderId', { appliedFiltersString: 'filters' }];
  @tracked ladderId = null;
  @tracked appliedFiltersString = null;

  @tracked ladderAndFilterControls;
  @tracked showAllFilterGroups = false;

  @action
  updateShowAllFilterGroups(event) {
    this.showAllFilterGroups = event.target.checked;
  }

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.model.filterGroups;
    } else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  }

  get chartLinkQueryParams() {
    return {
      ladderId: this.ladderId,
      filters: this.appliedFiltersString,
    };
  }

  @action
  updateLadderId(newId) {
    this.ladderId = newId;
  }

  @action
  updateAppliedFiltersString(newString) {
    this.appliedFiltersString = newString;
  }
}
