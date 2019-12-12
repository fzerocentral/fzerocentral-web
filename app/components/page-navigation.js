import DS from 'ember-data';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  pageNumber: null,
  pageResults: null,

  @computed('pageNumber', 'pageResults')
  get currentPageFirstResultNumber() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        return {value: (pageNumber - 1)*resultsPerPage + 1};
      })
    });
  },

  @computed('pageNumber', 'pageResults')
  get currentPageLastResultNumber() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let pageNumber = this.get('pageNumber');
        let resultsPerPage = Number(paginationMeta.resultsPerPage);
        let totalResults = Number(paginationMeta.totalResults);
        return {value: Math.min(pageNumber*resultsPerPage, totalResults)};
      })
    });
  },

  @computed('pageResults')
  get hasGapBetweenFirstAndPrevPage() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let firstPage = paginationMeta.firstPage;
        let prevPage = paginationMeta.prevPage;
        return {value: firstPage && prevPage && (prevPage - firstPage > 1)};
      })
    });
  },

  @computed('pageResults')
  get hasGapBetweenLastAndNextPage() {
    return DS.PromiseObject.create({
      promise: this.get('pageResults').then((pageResults) => {
        let paginationMeta = pageResults.meta.pagination;
        let lastPage = paginationMeta.lastPage;
        let nextPage = paginationMeta.nextPage;
        return {value: lastPage && nextPage && (lastPage - nextPage > 1)};
      })
    });
  },
});
