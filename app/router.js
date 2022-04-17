import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('games', function() {
    this.route('show', { path: '/:game_id' });
    this.route('chart-types', { path: '/:game_id/chart-types' });
    this.route('filter-groups', { path: '/:game_id/filter-groups' });
    this.route('ladder-new', { path: '/:game_id/ladder-new' });
    this.route('ladders', { path: '/:game_id/ladders' });
  });

  this.route('charts', function() {
    this.route('show', { path: '/:chart_id' });
    this.route('player-history',
               { path: '/:chart_id/players/:player_id/history' });
    this.route('top-record-history',
               { path: '/:chart_id/top-record-history' });
    this.route('record-new', { path: '/:chart_id/record-new' });
  });

  this.route('chart-groups', function() {
    this.route('show', { path: '/:chart_group_id' });
  });

  this.route('filter-groups', function() {
    this.route('show', { path: '/:filter_group_id' });
    this.route('filter-new', { path: '/:filter_group_id/filter-new' });
  });

  this.route('filters', function() {
    this.route('add-implication',
               { path: '/:filter_id/add-implication' });
    this.route('delete-implication',
               { path: '/:filter_id/delete-implication' });
    this.route('edit', { path: '/:filter_id/edit' });
  });

  this.route('ladders', function() {
    this.route('show', { path: '/:ladder_id' });
  });

  this.route('records', function() {
    this.route('show', { path: '/:record_id' });
  });
});
