import Controller from '@ember/controller';

export default class ChartGroupsShowController extends Controller {
  queryParams = ['mainChartId'];
  mainChartId = null;
}
