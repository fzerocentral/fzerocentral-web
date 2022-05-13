import Controller from '@ember/controller';

export default class LaddersShowController extends Controller {
  get firstEntry() {
    return this.model.ranking.objectAt(0);
  }
}
