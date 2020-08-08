import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('chart-group', params.chart_group_id);
  }
});
