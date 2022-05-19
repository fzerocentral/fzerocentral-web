import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
    updateExtraFiltersString
  ) {
    this.ladder = ladder;
    this.ladderFilterObjs = ladderFilterObjs;
    this.ladderOptions = ladderOptions;
    this.updateLadderId = updateLadderId;

    this.filterGroups = filterGroups;
    this.extraFilterObjs = extraFilterObjs;
    this.updateExtraFiltersString = updateExtraFiltersString;
  }

  @action
  switchLadder(event) {
    let destinationLadderId = event.target.value;
    this.updateLadderId(destinationLadderId);
  }
}
