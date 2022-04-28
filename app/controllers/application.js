import Controller from '@ember/controller';
import config from '../config/environment';


/* This is the controller for templates/application.hbs. */
export default class ApplicationController extends Controller {
  devMode = config.APP.devMode;
}
