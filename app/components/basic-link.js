import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/* Link without a custom click action, meaning it's a basic HTML link and
   doesn't use Ember transitions. This can help when transitions seem to make
   load times slower or run into buggy behavior. */
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

    return this.router.urlFor(...args);
  }
}
