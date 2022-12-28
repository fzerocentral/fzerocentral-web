# fzerocentral-web

Website frontend for the (upcoming) F-Zero Central website. Uses Ember.js.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/) (version 1.x)
* [Ember CLI](https://cli.emberjs.com/release/)
* [Google Chrome](https://google.com/chrome/) (to run automated tests in Chrome's headless mode)

## Installation

* `git clone <repository-url>` this repository
* `cd fzerocentral-web`
* `yarn install`

## Running / Development

* Get an instance of the [F-Zero Central API](https://github.com/fzerocentral/fzerocentral-api) up and running at [http://localhost:3000](http://localhost:3000).
* Run this ember app: `yarn run start`
* Visit the app at [http://localhost:4200](http://localhost:4200).
* Visit the tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `yarn lint`
* `yarn lint:fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

(TODO: Deployment instructions go here)

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://cli.emberjs.com/release/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
