import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class LaddersChartsController extends Controller {
  @service nonEmberDataApi;

  @tracked chartGroupId = null;
  @tracked chartHierarchy = [];

  @action
  updateChartHierarchy() {
    this.nonEmberDataApi
      .getChartHierarchy(this.chartGroupId)
      .then((results) => {
        this.chartHierarchy = results;
      });
  }
}
