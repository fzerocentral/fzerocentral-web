import { A } from '@ember/array';
import Controller from '@ember/controller';

export default Controller.extend({
  filterCreateError: null,
  filtersLastUpdated: null,
  selectedFilterId: null,
  usageTypeOptions: A(['choosable', 'implied']),
});
