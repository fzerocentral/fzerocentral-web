import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import config from '../config/environment';


/* This is the controller for templates/application.hbs. */
export default class ApplicationController extends Controller {
  @service router;

  devMode = config.APP.devMode;
  indexUrl = this.router.urlFor('index');
  rootURL = config.rootURL;
}
