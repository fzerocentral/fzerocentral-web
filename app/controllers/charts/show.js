import Controller from '@ember/controller';

export default class ChartsShowController extends Controller {
  queryParams = [{
    // On the Ember side this is `appliedFiltersString`; going out to the API
    // side we'll use `filters`.
    appliedFiltersString: 'filters'
  }];
  appliedFiltersString = null;
}
