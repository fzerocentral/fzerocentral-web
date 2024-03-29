'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'fzerocentral-web',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // FZC custom setting: The API namespace.
    // For dev environments it's easiest to run the API with no namespace,
    // i.e. at localhost:<port> instead of localhost:<port>/<namespace>.
    ENV.APP.apiNamespace = null;
    // FZC custom setting: Developer mode.
    ENV.APP.devMode = true;

    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // Serve the app here instead of at the root of the domain.
    ENV.rootURL = '/next/';
    // FZC custom setting: The API namespace.
    ENV.APP.apiNamespace = 'api';
    // FZC custom setting: Developer mode.
    ENV.APP.devMode = false;
  }

  return ENV;
};
