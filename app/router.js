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
  });
  this.route('chart-groups', { path: '/chart-groups' }, function() {
    this.route('show', { path: '/:chart_group_id' });
  });
});

export default Router;
