import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('games', function() {
    this.route('show', { path: '/:game_id' });
    this.route('ladder-new', { path: '/:game_id/ladder-new' });
    this.route('ladders', { path: '/:game_id/ladders' });
  });

  this.route('charts', function() {
    this.route('show', { path: '/:chart_id' });
    this.route('user-history', { path: '/:chart_id/users/:user_id/history' });
    this.route('top-record-history', {
      path: '/:chart_id/top-record-history'
    });
    this.route('record-new', { path: '/:chart_id/record-new' });
  });

  this.route('chart-groups', function() {
    this.route('show', { path: '/:chart_group_id' });
  });

  this.route('chart-types', function() {
    this.route('filter-groups', { path: '/:chart_type_id/filter-groups' });
  });

  this.route('filter-groups', function() {
    this.route('show', { path: '/:filter_group_id' });
  });

  this.route('ladders', function() {
    this.route('show', { path: '/:ladder_id' });
  });

  this.route('records', function() {
    this.route('show', { path: '/:record_id' });
  });
});
