import Component from '@glimmer/component';

export default class PageNavigationComponent extends Component {

  get meta() {
    if (!this.args.pageResults) {return null;}
    if (!this.args.pageResults.isFulfilled) {return null;}
    return this.args.pageResults.get('meta').pagination;
  }

  get resultsPerPage() {
    // TODO: Get from API, rather than hardcoding.
    //return Number(this.meta['page[size]']);
    return 10;
  }

  get prevPage() {
    if (!this.meta) {return null;}
    return this.meta.page - 1;
  }

  get nextPage() {
    if (!this.meta) {return null;}
    return this.meta.page + 1;
  }

  get lastPage() {
    if (!this.meta) {return null;}

    let resultCount = Number(this.meta.count);
    return Math.ceil(resultCount / this.resultsPerPage);
  }

  get currentPageFirstResultNumber() {
    if (!this.meta) {return " ";}
    return (this.meta.page - 1)*this.resultsPerPage + 1;
  }
  get currentPageLastResultNumber() {
    if (!this.meta) {return " ";}

    let resultCount = Number(this.meta.count);
    return Math.min(this.meta.page*this.resultsPerPage, resultCount);
  }

  get shouldShowFirstPageLink() {
    if (!this.meta) {return false;}
    return this.meta.page >= 2;
  }

  get hasGapBetweenFirstAndPrevPage() {
    if (!this.meta) {return false;}
    return this.meta.page >= 4;
  }

  get shouldShowPrevPageLink() {
    if (!this.meta) {return false;}
    return this.meta.page >= 3;
  }

  get shouldShowNextPageLink() {
    if (!this.meta) {return false;}
    return this.meta.page <= this.meta.pages - 2;
  }

  get hasGapBetweenLastAndNextPage() {
    if (!this.meta) {return false;}
    return this.meta.page <= this.meta.pages - 3;
  }

  get shouldShowLastPageLink() {
    if (!this.meta) {return false;}
    return this.meta.page <= this.meta.pages - 1;
  }

  get hasMultiplePages() {
    if (!this.meta) {return false;}
    return Number(this.meta.count) > this.resultsPerPage;
  }
}
