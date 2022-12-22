import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PageNavigationOnePageComponent extends Component {
  @service router;

  get routeName() {
    return this.router.currentRouteName;
  }

  get queryHash() {
    let queryHash = this.router.currentRoute.queryParams;
    queryHash.page = this.args.page;
    return queryHash;
  }
}
