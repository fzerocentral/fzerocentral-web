import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { filterSpecStrToDisplays } from "../utils/filter-specs";


export default class LadderAndFilterControlsComponent extends Component {}


export class LadderAndFilterControlsManager {

  // Show filter controls initially if there are any extra filters.
  @tracked showFilterControls;

  constructor(
      ladder,
      ladderFilterObjs,
      ladderOptions,
      updateLadderId,
      extraFiltersString,
      filterGroups,
      extraFilterObjs,
      getFilterOptions,
      updateExtraFiltersString) {

    this.ladder = ladder;
    this.ladderFilterObjs = ladderFilterObjs;
    this.ladderOptions = ladderOptions;
    this.updateLadderId = updateLadderId;

    this.extraFiltersString = extraFiltersString;
    this.filterGroups = filterGroups;
    this.extraFilterObjs = extraFilterObjs;
    this.getFilterOptions = getFilterOptions;
    this.updateExtraFiltersString = updateExtraFiltersString;

    this.showFilterControls = (this.extraFiltersString !== null);
  }

  @action
  switchLadder(event) {
    let destinationLadderId = event.target.value;
    this.updateLadderId(destinationLadderId);
  }

  @action
  onShowFilterControlsInput(event) {
    this.showFilterControls = event.target.checked;
  }

  get ladderFilterDisplays() {
    return filterSpecStrToDisplays(
      this.ladder.filterSpec, this.ladderFilterObjs);
  }
}
