import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ChartRankingSingleComponent extends Component {
  @tracked showAllFilterGroups = null;

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.args.filterGroups;
    }
    else {
      return this.args.filterGroups.filterBy('showByDefault', true);
    }
  }
}
