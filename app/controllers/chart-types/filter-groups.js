import { A } from '@ember/array';
import Controller from '@ember/controller';
import DS from 'ember-data';
import { action, computed } from '@ember/object';

export default class ChartTypesFilterGroupsController extends Controller {

  @computed('model')
  get game() {
    return this.model.chartType.get('game');
  }

  // Filter groups which are not associated with this chart type, but are in
  // the same game as this chart type
  @computed('model')
  get otherFilterGroups() {
    let gameFilterGroupsPromise = this.get('store').query(
      'filter-group', {game_id: this.get('game').get('id')}
    );

    return DS.PromiseArray.create({
      promise: gameFilterGroupsPromise.then((gameFilterGroups) => {
        let result = A([]);
        gameFilterGroups.forEach((filterGroup) => {
          if (this.model.filterGroups.findBy('id', filterGroup.id)
              === undefined) {
            // This filter group is not associated with the chart type
            result.pushObject(filterGroup);
          }
        });
        return result;
      })
    });
  }

  @action
  onOrderChange(ctfg) {
    ctfg.save().then(() => {this.send('refreshRoute');});
  }

  @action
  onShowChange(ctfg, showByDefault) {
    ctfg.set('showByDefault', showByDefault);
    ctfg.save().then(() => {this.send('refreshRoute');});
  }
}
