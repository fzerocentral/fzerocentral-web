import Controller from '@ember/controller';
import { filterSpecStrToDisplays } from '../../utils/filter-specs';

export default class LaddersShowController extends Controller {
  get firstEntry() {
    return this.model.ranking.objectAt(0);
  }

  get ladderFilterDisplays() {
    return filterSpecStrToDisplays(
      this.model.ladder.filterSpec,
      this.model.ladderFilterObjs
    );
  }
}
