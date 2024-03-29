import Service from '@ember/service';
import ENV from '../config/environment';

/* API calls that don't use Ember Data. */
export default class NonEmberDataApiService extends Service {
  apiUrl(url) {
    if (ENV.APP.apiNamespace) {
      return `/${ENV.APP.apiNamespace}${url}`;
    }
    return url;
  }

  fetchResults(url) {
    return fetch(this.apiUrl(url))
      .then((response) => response.json())
      .then((responseJson) => responseJson.data);
  }

  postPatchDelete(url, data, method) {
    return fetch(this.apiUrl(url), {
      method: method,
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({ data: data }),
    }).then((response) => {
      if (response.status === 204) {
        // No content
        return {};
      } else {
        return response.json();
      }
    });
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

  /*
  The following methods get data in a non JSON:API format. These API
  endpoints exist for convenience so that Ember doesn't have to do too much
  rearranging of data for certain pages.
  */

  getChartHierarchy(chartGroupId) {
    let url = `/chart_groups/${chartGroupId}/hierarchy/`;
    return this.fetchResults(url);
  }

  getChartRanking(chartId, ladderId, extraFiltersString) {
    let rankingUrl = this.urlWithQueryParams(
      `/charts/${chartId}/ranking/`,
      new Map([
        ['ladder_id', ladderId],
        ['filters', extraFiltersString],
        ['page[size]', 1000],
      ])
    );
    return this.fetchResults(rankingUrl);
  }

  getChartOtherRecords(chartId, ladderId, extraFiltersString) {
    let url = this.urlWithQueryParams(
      `/charts/${chartId}/other_records/`,
      new Map([
        ['ladder_id', ladderId],
        ['filters', extraFiltersString],
        ['page[size]', 1000],
      ])
    );
    return this.fetchResults(url);
  }

  getChartTopRecordHistory(chartId, ladderId, extraFiltersString) {
    let historyUrl = this.urlWithQueryParams(
      `/charts/${chartId}/record_history/`,
      new Map([
        ['improvements', 'filter'],
        ['ladder_id', ladderId],
        ['filters', extraFiltersString],
        ['page[size]', 100],
      ])
    );
    return this.fetchResults(historyUrl);
  }

  getChartPlayerHistory(chartId, playerId, ladderId, extraFiltersString) {
    let historyUrl = this.urlWithQueryParams(
      `/charts/${chartId}/record_history/`,
      new Map([
        ['player_id', playerId],
        ['ladder_id', ladderId],
        ['filters', extraFiltersString],
        ['page[size]', 100],
      ])
    );
    return this.fetchResults(historyUrl);
  }

  getLadderRanking(ladderId) {
    let rankingUrl = `/ladders/${ladderId}/ranking/`;
    return this.fetchResults(rankingUrl);
  }

  /*
  The following methods create, update, and delete resources in a JSON:API
  standard way. These methods exist because Ember Data is difficult to get
  working just right for these kinds of endpoints, particularly in terms of
  rolling back data if the API returns an error.
  */

  deleteResource(resourceType, resourceId) {
    let deleteUrl = `/${resourceType}/${resourceId}/`;
    return this.delete(deleteUrl, null);
  }

  createFilter(filterGroupId, attributes) {
    let createUrl = `/filters/`;
    let data = {
      type: 'filters',
      attributes: attributes,
      relationships: {
        'filter-group': {
          data: {
            type: 'filter-groups',
            id: filterGroupId,
          },
        },
      },
    };
    return this.post(createUrl, data);
  }

  editFilter(filterId, attributes) {
    let filterUrl = `/filters/${filterId}/`;
    let data = {
      type: 'filters',
      id: filterId,
      attributes: attributes,
    };
    return this.patch(filterUrl, data);
  }

  addFilterImplication(selectedFilterId, targetFilterId) {
    let implicationRelationshipUrl = `/filters/${selectedFilterId}/relationships/outgoing_filter_implications/`;
    return this.post(implicationRelationshipUrl, [
      { type: 'filters', id: targetFilterId },
    ]);
  }

  deleteFilterImplication(selectedFilterId, targetFilterId) {
    let implicationRelationshipUrl = `/filters/${selectedFilterId}/relationships/outgoing_filter_implications/`;
    return this.delete(implicationRelationshipUrl, [
      { type: 'filters', id: targetFilterId },
    ]);
  }

  createLadder(gameId, chartGroupId, attributes) {
    let createUrl = `/ladders/`;
    let data = {
      type: 'ladders',
      attributes: attributes,
      relationships: {
        'chart-group': { data: { type: 'chart-groups', id: chartGroupId } },
        game: { data: { type: 'games', id: gameId } },
      },
    };
    return this.post(createUrl, data);
  }

  createRecord(chartId, attributes, playerId, filterIds) {
    let createUrl = `/records/`;
    let filterData = filterIds.map((filterId) => {
      return { type: 'filters', id: filterId };
    });
    let data = {
      type: 'records',
      attributes: attributes,
      relationships: {
        chart: { data: { type: 'charts', id: chartId } },
        player: { data: { type: 'players', id: playerId } },
        filters: { data: filterData },
      },
    };
    return this.post(createUrl, data);
  }

  editRecord(recordId, attributes, filterIds) {
    let editUrl = `/records/${recordId}/`;
    let filterData = filterIds.map((filterId) => {
      return { type: 'filters', id: filterId };
    });
    let data = {
      type: 'records',
      id: recordId,
      attributes: attributes,
      relationships: {
        filters: { data: filterData },
      },
    };
    return this.patch(editUrl, data);
  }
}
