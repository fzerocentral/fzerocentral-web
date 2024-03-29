'use strict';

module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'ember/no-controller-access-in-routes': 'off',
    'prettier/prettier': [
      'error',
      {
        // Only check for consistency of line separators in each file. This
        // allows CRLF systems to have autocrlf on in their Git config for
        // this repo. That, in turn, allows Ember codemods to work on CRLF
        // systems (because the codemods actually apply CRLF on CRLF systems).
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      },
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
    {
      // mirage files
      // https://github.com/ember-cli/eslint-plugin-ember/issues/202
      files: ['mirage/**'],
      rules: {
        'ember/avoid-leaking-state-in-ember-objects': 'off',
      },
    },
  ],
};
