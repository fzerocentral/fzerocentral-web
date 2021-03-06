import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  @action
  onOrderChange(ladder) {
    ladder.save().then(() => {
      // Ensure the ladder list order is updated by refreshing the route.
      // https://stackoverflow.com/a/44146547/
      const currentRouteName = this.get('router.currentRouteName');
      const currentRouteInstance = getOwner(this).lookup(`route:${currentRouteName}`);
      currentRouteInstance.refresh();
    });
  },
});
