import Controller from '@ember/controller';
import config from '../../config/environment';


export default class GamesShowController extends Controller {
  devMode = config.APP.devMode;
}
