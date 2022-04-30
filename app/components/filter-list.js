import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FilterListComponent extends Component {
  @action
  onSearchTextChange(event) {
    // Reset the page number, since new search results may have less pages
    // than previous search results.
    this.args.updatePageNumber(1);

    this.args.updateSearchText(event.target.value);
  }
}
