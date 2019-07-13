import DS from 'ember-data';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  pageNumber: null,
  pageResults: null,

  currentPageFirstResultNumber: computed('pageNumber', 'pageResults', function() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        return {value: (pageNumber - 1)*resultsPerPage + 1};
      })
    });
  }),

  currentPageLastResultNumber: computed('pageNumber', 'pageResults', function() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        let totalResults = Number(paginationMeta.totalResults);
        return {value: Math.min(pageNumber*resultsPerPage, totalResults)};
      })
    });
  }),

  hasGapBetweenFirstAndPrevPage: computed('pageResults', function() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let firstPage = paginationMeta.firstPage;
        let prevPage = paginationMeta.prevPage;
        return {value: firstPage && prevPage && (prevPage - firstPage > 1)};
      })
    });
  }),

  hasGapBetweenLastAndNextPage: computed('pageResults', function() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let lastPage = paginationMeta.lastPage;
        let nextPage = paginationMeta.nextPage;
        return {value: lastPage && nextPage && (lastPage - nextPage > 1)};
      })
    });
  }),
});
