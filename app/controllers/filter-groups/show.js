import { A } from '@ember/array';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FilterGroupsShowController extends Controller {
  queryParams = [
    'choosable_filters_name_search', 'choosable_filters_page',
    'implied_filters_name_search', 'implied_filters_page',
  ];

  @tracked choosable_filters_name_search = '';
  @tracked choosable_filters_page = 1;
  @tracked implied_filters_name_search = '';
  @tracked implied_filters_page = 1;

  @tracked model;

  filterCreateError = null;
  selectedFilterId = null;
  usageTypeOptions = A(['choosable', 'implied']);

  @action
  updateChoosableSearchText(inputElement) {
    this.choosable_filters_name_search = inputElement.target.value;
  }

  @action
  updateImpliedSearchText(inputElement) {
    this.implied_filters_name_search = inputElement.target.value;
  }

  @action
  updateChoosablePage(pageNumber) {
    this.choosable_filters_page = pageNumber;
  }

  @action
  updateImpliedPage(pageNumber) {
    this.implied_filters_page = pageNumber;
  }
}
