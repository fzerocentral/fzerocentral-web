import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ChartRankingSingleComponent extends Component {
  @tracked showAllFilterGroups = null;

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.args.filterGroups;
    }
    else {
      // Show only default filter groups for this chart type
      let defaultFilterGroupIds = [];
      this.args.ctfgs.forEach((ctfg) => {
        if (ctfg.showByDefault === true) {
          // Non-tests can just do ctfg.chartTypeId, tests need get().
          defaultFilterGroupIds.push(ctfg.chartType.get('id'));
        }
      });
      return this.args.filterGroups.filter(
        (filterGroup) => defaultFilterGroupIds.includes(filterGroup.id));
    }
  }
}
