import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      filterGroup: this.get('store').findRecord(
        'filter-group', params.filter_group_id),
      filters: this.get('store').query(
        'filter', {filter_group_id: params.filter_group_id}),
    });
  },
});
