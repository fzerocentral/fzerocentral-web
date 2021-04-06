import { A } from '@ember/array';
import Controller from '@ember/controller';

export default class FilterGroupsShowController extends Controller {
  filterCreateError = null;
  filtersLastUpdated = null;
  selectedFilterId = null;
  usageTypeOptions = A(['choosable', 'implied']);
}
