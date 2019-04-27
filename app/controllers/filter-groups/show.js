import { A } from '@ember/array';
import Controller from '@ember/controller';

export default Controller.extend({
  selectedFilterId: null,
  usageTypeOptions: A(['choosable', 'implied']),
});
