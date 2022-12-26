import Component from '@glimmer/component';

export default class PageNavigationComponent extends Component {
  get prevNextMaxNumber() {
    return this.args.prevNextMaxNumber || 3;
  }

  get meta() {
    if (!this.args.pageResults) {
      return null;
    }
    return this.args.pageResults.meta.pagination;
  }

  get prevPages() {
    if (!this.meta) {
      return [];
    }

    let pages = [];
    for (
      let page = this.meta.page - this.prevNextMaxNumber;
      page <= this.meta.page - 1;
      page++
    ) {
      if (page > 1) {
        pages.push(page);
      }
    }
    return pages;
  }

  get nextPages() {
    if (!this.meta) {
      return [];
    }

    let pages = [];
    for (
      let page = this.meta.page + 1;
      page <= this.meta.page + this.prevNextMaxNumber;
      page++
    ) {
      if (page < this.lastPage) {
        pages.push(page);
      }
    }
    return pages;
  }

  get lastPage() {
    if (!this.meta) {
      return null;
    }
    return this.meta.pages;
  }

  get shouldShowFirstPageLink() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page >= 2;
  }

  get hasGapBetweenFirstAndPrevPages() {
    let prevPages = this.prevPages;
    if (prevPages.length === 0) {
      return false;
    }
    return prevPages[0] >= 3;
  }

  get hasGapBetweenLastAndNextPages() {
    let nextPages = this.nextPages;
    if (nextPages.length === 0) {
      return false;
    }
    return nextPages.at(-1) <= this.lastPage - 2;
  }

  get shouldShowLastPageLink() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page <= this.lastPage - 1;
  }

  get hasMultiplePages() {
    if (!this.meta) {
      return false;
    }
    return this.meta.pages >= 2;
  }
}
