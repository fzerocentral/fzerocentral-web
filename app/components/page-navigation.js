import Component from '@glimmer/component';

export default class PageNavigationComponent extends Component {
  get meta() {
    if (!this.args.pageResults) {
      return null;
    }
    return this.args.pageResults.meta.pagination;
  }

  get prevPage() {
    if (!this.meta) {
      return null;
    }
    return this.meta.page - 1;
  }

  get nextPage() {
    if (!this.meta) {
      return null;
    }
    return this.meta.page + 1;
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

  get hasGapBetweenFirstAndPrevPage() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page >= 4;
  }

  get shouldShowPrevPageLink() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page >= 3;
  }

  get shouldShowNextPageLink() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page <= this.meta.pages - 2;
  }

  get hasGapBetweenLastAndNextPage() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page <= this.meta.pages - 3;
  }

  get shouldShowLastPageLink() {
    if (!this.meta) {
      return false;
    }
    return this.meta.page <= this.meta.pages - 1;
  }

  get hasMultiplePages() {
    if (!this.meta) {
      return false;
    }
    return this.meta.pages >= 2;
  }
}
