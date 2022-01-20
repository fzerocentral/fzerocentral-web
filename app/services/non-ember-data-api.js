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

  getChartRanking(chartId, _appliedFiltersString) {
    let appliedFiltersString = _appliedFiltersString || '';
    let rankingUrl = `/charts/${chartId}/ranking/`
      + `?filters=${appliedFiltersString}&page[size]=1000`;
    return this.fetchArrayResults(rankingUrl);
  }

  getChartGroupRanking(chartGroupId, mainChartId, _appliedFiltersString) {
    let appliedFiltersString = _appliedFiltersString || '';
    let rankingUrl = `/chart_groups/${chartGroupId}/ranking/`
      + `?main_chart_id=${mainChartId}&filters=${appliedFiltersString}`
      + `&page[size]=1000`;
    return this.fetchArrayResults(rankingUrl);
  }

  getChartTopRecordHistory(chartId, _appliedFiltersString) {
    let appliedFiltersString = _appliedFiltersString || '';
    let historyUrl = `/charts/${chartId}/record_history/`
      + `?improvements=filter&filters=${appliedFiltersString}`
      + `&page[size]=50`;
    return this.fetchArrayResults(historyUrl);
  }

  getChartPlayerHistory(chartId, playerId, _appliedFiltersString) {
    let appliedFiltersString = _appliedFiltersString || '';
    let historyUrl = `/charts/${chartId}/record_history/`
      + `?player_id=${playerId}&filters=${appliedFiltersString}`
      + `&page[size]=50`;
    return this.fetchArrayResults(historyUrl);
  }
}
