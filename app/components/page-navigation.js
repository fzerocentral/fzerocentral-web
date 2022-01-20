import Component from '@glimmer/component';

export default class PageNavigationComponent extends Component {

  get currentPageFirstResultNumber() {
    if (!this.args.pageResults) {return " ";}

    let meta = this.args.pageResults.get('meta').pagination;
    let resultsPerPage = Number(meta.resultsPerPage);
    return (this.args.pageNumber - 1)*resultsPerPage + 1;
  }

  get currentPageLastResultNumber() {
    if (!this.args.pageResults) {return " ";}

    let meta = this.args.pageResults.get('meta').pagination;
    let resultsPerPage = Number(meta.resultsPerPage);
    let totalResults = Number(meta.totalResults);
    return Math.min(this.args.pageNumber*resultsPerPage, totalResults);
  }

  get hasGapBetweenFirstAndPrevPage() {
    if (!this.args.pageResults) {return false;}

    let meta = this.args.pageResults.get('meta').pagination;
    return meta.firstPage && meta.prevPage && (meta.prevPage - meta.firstPage > 1);
  }

  get hasGapBetweenLastAndNextPage() {
    if (!this.args.pageResults) {return false;}

    let meta = this.args.pageResults.get('meta').pagination;
    return meta.lastPage && meta.nextPage && (meta.lastPage - meta.nextPage > 1);
  }

  get hasMultiplePages() {
    if (!this.args.pageResults) {return false;}

    // In some trivial cases, pageResults may be an empty
    // PromiseArray which we didn't bother adding a meta attribute to.
    if (!this.args.pageResults.get('meta')) {return false;}

    let paginationMeta = this.args.pageResults.get('meta').pagination;
    let totalResults = Number(paginationMeta.totalResults);
    let resultsPerPage = Number(paginationMeta.resultsPerPage);
    return totalResults > resultsPerPage;
  }
}
