import Component from '@glimmer/component';
import { filterSpecStrToDisplays } from '../utils/filter-specs';

export default class FilterSpecDisplayComponent extends Component {
  get ladderFilterDisplays() {
    return filterSpecStrToDisplays(this.args.filterSpec, this.args.filterObjs);
  }
}
