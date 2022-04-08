import Controller from '@ember/controller';
import { action } from '@ember/object';


export default class FilterGroupsShowController extends Controller {

  @action
  saveRecord() {
    let record = this.model.record;

    record.save().then(() => {
      this.target.transitionTo('charts.show', record.chart.get('id'));
    });
  }
}
