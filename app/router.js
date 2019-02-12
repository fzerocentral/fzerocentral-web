import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('games', { path: '/games' }, function() {
    this.route('show', { path: '/:game_id' });
  });
  this.route('charts', { path: '/charts' }, function() {
    this.route('show', { path: '/:chart_id' });
    this.route('user-history', { path: '/:chart_id/users/:user_id/history' });
    this.route('top-record-history', {
      path: '/:chart_id/top-record-history'
    });
    this.route('record-new', { path: '/:chart_id/record-new' });
  });
  this.route('chart-groups', { path: '/chart-groups' }, function() {
    this.route('show', { path: '/:chart_group_id' });
  });

  this.route('chart-types', { path: '/chart-types' }, function() {
    this.route('filter-groups', { path: '/:chart_type_id/filter-groups' });
  });

  this.route('filter-groups', { path: '/filter-groups' }, function() {
    this.route('show', { path: '/:filter_group_id' });
  });

  this.route('records', { path: '/records' }, function() {
    this.route('show', { path: '/:record_id' });
  });
});

export default Router;
