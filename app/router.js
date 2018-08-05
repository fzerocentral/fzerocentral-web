import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('about');
  this.route('contact');
  this.route('games', function() {});
  this.route('rentals', function() {
    this.route('show', { path: '/:rental_id' });
  });
  this.route('charts', { path: '/charts/:chart_id' });
  this.route('chart-groups', { path: '/chart-groups/:chart_group_id' });
});

export default Router;
