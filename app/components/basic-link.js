import Component from '@glimmer/component';
import { service } from '@ember/service';

/* Link without a custom click action, meaning it's a basic HTML link and
   doesn't use Ember transitions. This can help when transitions seem to cause
   slower loading or buggy behavior, or when URL fragments are desired. */
export default class LinkComponent extends Component {
  @service router;

  get href() {
    const args = [this.args.route];

    if ('model' in this.args) {
      args.push(this.args.model);
    }

    if ('query' in this.args) {
      args.push({
        queryParams: this.args.query,
      });
    }

    let url = this.router.urlFor(...args);

    if (this.args.fragment) {
      url = `${url}#${this.args.fragment}`;
    }

    return url;
  }
}
