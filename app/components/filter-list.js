import DS from 'ember-data';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  filterGroupId: null,
  pageNumber: 1,
  store: service('store'),
  usageType: null,

  filters: computed('filterGroupId', 'pageNumber', 'usageType', function() {
    let args = {};

    let filterGroupId = this.get('filterGroupId');
    if (filterGroupId === null) { return null; }
    args['filter_group_id'] = filterGroupId;

    let pageNumber = this.get('pageNumber');
    args['page'] = pageNumber;

    let usageType = this.get('usageType');
    if (usageType !== null) {
      args['usage_type'] = usageType;
    }

    return this.get('store').query('filter', args);
  }),

  hasMultiplePages: computed('filters', function() {
    return DS.PromiseObject.create({
      promise: this.get('filters').then((filters) => {
        let paginationMeta = filters.meta.pagination;
        let totalResults = Number(paginationMeta.totalResults);
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        return {value: totalResults > resultsPerPage};
      })
    });
  }),

  currentPageFirstResultNumber: computed('filters', 'pageNumber', function() {
    return DS.PromiseObject.create({
      promise: this.get('filters').then((filters) => {
        let paginationMeta = filters.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        return {value: (pageNumber - 1)*resultsPerPage + 1};
      })
    });
  }),

  currentPageLastResultNumber: computed('filters', 'pageNumber', function() {
    return DS.PromiseObject.create({
      promise: this.get('filters').then((filters) => {
        let paginationMeta = filters.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        let totalResults = Number(paginationMeta.totalResults);
        return {value: Math.min(pageNumber*resultsPerPage, totalResults)};
      })
    });
  }),

  hasGapBetweenFirstAndPrevPage: computed('filters', function() {
    return DS.PromiseObject.create({
      promise: this.get('filters').then((filters) => {
        let paginationMeta = filters.meta.pagination;
        let firstPage = paginationMeta.firstPage;
        let prevPage = paginationMeta.prevPage;
        return {value: firstPage && prevPage && (prevPage - firstPage > 1)};
      })
    });
  }),

  hasGapBetweenLastAndNextPage: computed('filters', function() {
    return DS.PromiseObject.create({
      promise: this.get('filters').then((filters) => {
        let paginationMeta = filters.meta.pagination;
        let lastPage = paginationMeta.lastPage;
        let nextPage = paginationMeta.nextPage;
        return {value: lastPage && nextPage && (lastPage - nextPage > 1)};
      })
    });
  }),
});
