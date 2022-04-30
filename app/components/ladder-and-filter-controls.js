import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { filterSpecStrToDisplays } from '../utils/filter-specs';

export default class LadderAndFilterControlsComponent extends Component {
  // Show filter controls initially if there are any extra filters.
  @tracked showFilterControls = this.args.extraFiltersString !== null;

  @action
  onShowFilterControlsInput(event) {
    this.showFilterControls = event.target.checked;
  }
}

export class LadderAndFilterControlsManager {
  constructor(
    ladder,
    ladderFilterObjs,
    ladderOptions,
    updateLadderId,
    filterGroups,
    extraFilterObjs,
    getFilterOptions,
    updateExtraFiltersString
  ) {
    this.ladder = ladder;
    this.ladderFilterObjs = ladderFilterObjs;
    this.ladderOptions = ladderOptions;
    this.updateLadderId = updateLadderId;

    this.filterGroups = filterGroups;
    this.extraFilterObjs = extraFilterObjs;
    this.getFilterOptions = getFilterOptions;
    this.updateExtraFiltersString = updateExtraFiltersString;
  }

  @action
  switchLadder(event) {
    let destinationLadderId = event.target.value;
    this.updateLadderId(destinationLadderId);
  }

  get ladderFilterDisplays() {
    return filterSpecStrToDisplays(
      this.ladder.filterSpec,
      this.ladderFilterObjs
    );
  }
}
