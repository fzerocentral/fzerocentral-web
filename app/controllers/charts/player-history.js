import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class ChartsPlayerHistoryController extends Controller {
  @tracked showAllFilterGroups = false;

  @action
  updateShowAllFilterGroups(event) {
    this.showAllFilterGroups = event.target.checked;
  }

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.model.filterGroups;
    }
    else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  }
}
