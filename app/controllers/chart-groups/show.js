import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChartGroupsShowController extends Controller {
  queryParams = ['mainChartId'];
  mainChartId = null;
  @service nonEmberDataApi;

  @computed('model')
  get recordRows() {
    return this.nonEmberDataApi.getChartGroupRanking(
      this.model.id, this.mainChartId, null);
  }
}
