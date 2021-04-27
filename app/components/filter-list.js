import Component from '@glimmer/component';

export default class FilterListComponent extends Component {

  pageNumber = 1;
  searchText = '';

  // TODO: If you're not on page 1 and you type some searchText, the page
  // number won't reset, so the results may appear blank. It's not that
  // intrusive, but would be nice to fix.
}
