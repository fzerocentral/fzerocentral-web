import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from '../../config/environment';
import { getFormValue } from "../../utils/forms";


export default class ChartsShowController extends Controller {
  queryParams = [
    'ladderId',
    // On the Ember side this is `appliedFiltersString`; going out to the API
    // side we'll use `filters`.
    {appliedFiltersString: 'filters'},
    {columnOption: 'columns'},
  ];
  @tracked ladderId = null;
  @tracked appliedFiltersString = null;
  @tracked columnOption = 'filter-groups';

  @service router;

  devMode = config.APP.devMode;

  @tracked ladderAndFilterControls;
  @tracked showAllFilterGroups = false;

  @tracked chartNavigationChoices = [];
  @tracked chartNavigationPrevious = null;
  @tracked chartNavigationNext = null;
  @tracked currentCgCharts = [];
  @tracked currentCgOtherCharts = [];
  @tracked otherRecords = {};

  @action
  onShowAllFilterGroupsInput(event) {
    this.showAllFilterGroups = event.target.checked;
  }

  get shownFilterGroups() {
    if (this.showAllFilterGroups) {
      return this.model.filterGroups;
    }
    else {
      return this.model.filterGroups.filterBy('showByDefault', true);
    }
  }

  @action
  getFilterOptions(filterGroupId, searchText) {
    return this.store.query('filter', {
      filter_group_id: filterGroupId,
      name_search: searchText,
    })
  }

  get chartGroup() {
    return this.model.chart.chartGroup;
  }

  @action
  onColumnOptionInput(event) {
    this.columnOption = event.target.value;
  }

  get chartLinkQueryParams() {
    return {
      ladderId: this.ladderId,
      filters: this.appliedFiltersString,
      columns: this.columnOption,
    }
  }
  get historyLinkQueryParams() {
    return {
      ladderId: this.ladderId,
      filters: this.appliedFiltersString,
    }
  }

  get destinationChartId() {
    let form = document.getElementById('chart-navigation-form');
    return getFormValue(form, 'chart');
  }

  @action
  goToChart() {
    // The chart dropdown doesn't get reset to the current chart if we use
    // transitionTo(). Couldn't figure out how to fix that, so using
    // window.location instead.
    window.location.assign(
      this.router.urlFor(
        'charts.show', this.destinationChartId,
        {queryParams: this.chartLinkQueryParams},
      ));
  }

  @action
  updateLadderId(newId) {
    this.ladderId = newId;
  }

  @action
  updateAppliedFiltersString(newString) {
    this.appliedFiltersString = newString;
  }
}
