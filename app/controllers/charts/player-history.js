import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import config from '../../config/environment';

export default class ChartsPlayerHistoryController extends Controller {
  queryParams = ['ladderId', { extraFiltersString: 'filters' }];
  @tracked ladderId = null;
  @tracked extraFiltersString = null;

  devMode = config.APP.devMode;

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
      filters: this.extraFiltersString,
    };
  }

  @action
  updateLadderId(newId) {
    this.ladderId = newId;
  }

  @action
  updateExtraFiltersString(newString) {
    this.extraFiltersString = newString;
  }
}
