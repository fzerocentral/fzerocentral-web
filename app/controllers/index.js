import Controller from '@ember/controller';
import config from '../config/environment';

export default class IndexController extends Controller {
  rootURL = config.rootURL;
}
