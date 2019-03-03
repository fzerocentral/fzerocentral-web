'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'fzerocentral-web',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // Custom ENV key: The JSONAPIAdapter's namespace.
    // For dev environments it's easiest to run the API with no namespace,
    // i.e. at localhost:<port> instead of localhost:<port>/<namespace>.
    ENV.APP.apiNamespace = null;

    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // Track requests made during tests, so we can make assertions on those
    // requests.
    // https://github.com/samselikoff/ember-cli-mirage/issues/1200
    ENV['ember-cli-mirage'] = {
      trackRequests: true
    };

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // use mirage in production too since the app will break
    // if there is no API for Ember Data
    ENV['ember-cli-mirage'] = {
      enabled: true
    }

    // Custom ENV key: The JSONAPIAdapter's namespace.
    ENV.APP.apiNamespace = 'api';
  }

  return ENV;
};
