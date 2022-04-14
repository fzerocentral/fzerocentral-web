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

  postPatchDelete(url, data, method) {
    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({'data': data}),
    }).then(response => response.json());
  }

  post(url, data) {
    return this.postPatchDelete(url, data, 'POST');
  }
  patch(url, data) {
    return this.postPatchDelete(url, data, 'PATCH');
  }
  delete(url, data) {
    return this.postPatchDelete(url, data, 'DELETE');
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


  createFilter(filterGroupId, attributes) {
    let createUrl = `/filters/`;
    let data = {
      'type': 'filters',
      'attributes': attributes,
      'relationships': {
        'filter-group': {
          "data": {
            "type": "filter-groups",
            "id": filterGroupId,
          }
        }
      }
    };
    return this.post(createUrl, data);
  }

  editFilter(filterId, attributes) {
    let filterUrl = `/filters/${filterId}/`;
    let data = {
      'type': 'filters',
      'id': filterId,
      'attributes': attributes,
    };
    return this.patch(filterUrl, data);
  }

  addFilterImplication(selectedFilterId, targetFilterId) {
    let implicationRelationshipUrl =
      `/filters/${selectedFilterId}/relationships/outgoing_filter_implications/`;
    return this.post(
      implicationRelationshipUrl,
      [{'type': 'filters', 'id': targetFilterId}]);
  }

  deleteFilterImplication(selectedFilterId, targetFilterId) {
    let implicationRelationshipUrl =
      `/filters/${selectedFilterId}/relationships/outgoing_filter_implications/`;
    return this.delete(
      implicationRelationshipUrl,
      [{'type': 'filters', 'id': targetFilterId}]);
  }
}
