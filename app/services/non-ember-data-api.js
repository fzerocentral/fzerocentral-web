import DS from 'ember-data';
import Service from '@ember/service';


/* API calls that don't fit Ember Data's constraints. */
export default class NonEmberDataApiService extends Service {

  fetchArrayResults(url) {
    return DS.PromiseArray.create({
      promise: fetch(url)
        .then(response => response.json())
        .then(responseJson => responseJson.data)
    });
  }

  urlWithQueryParams(baseUrl, queryParams) {
    for (const [key, value] of queryParams) {
      if (value === null) {
        queryParams.delete(key);
      }
    }
    let searchParams = new URLSearchParams(queryParams);
    return baseUrl + '?' + searchParams;
  }

  getChartRanking(chartId, appliedFiltersString) {
    let rankingUrl = this.urlWithQueryParams(
      `/charts/${chartId}/ranking/`,
      new Map([['filters', appliedFiltersString], ['page[size]', 1000]]));
    return this.fetchArrayResults(rankingUrl);
  }

  getChartGroupRanking(chartGroupId, mainChartId, appliedFiltersString) {
    let rankingUrl = this.urlWithQueryParams(
      `/chart_groups/${chartGroupId}/ranking/`,
      new Map([
        ['main_chart_id', mainChartId], ['filters', appliedFiltersString],
        ['page[size]', 1000]]));
    return this.fetchArrayResults(rankingUrl);
  }

  getChartTopRecordHistory(chartId, appliedFiltersString) {
    let historyUrl = this.urlWithQueryParams(
      `/charts/${chartId}/record_history/`,
      new Map([
        ['improvements', 'filter'], ['filters', appliedFiltersString],
        ['page[size]', 50]]));
    return this.fetchArrayResults(historyUrl);
  }

  getChartPlayerHistory(chartId, playerId, appliedFiltersString) {
    let historyUrl = this.urlWithQueryParams(
      `/charts/${chartId}/record_history/`,
      new Map([
        ['player_id', playerId], ['filters', appliedFiltersString],
        ['page[size]', 50]]));
    return this.fetchArrayResults(historyUrl);
  }
}
