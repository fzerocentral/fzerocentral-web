import { A } from '@ember/array';
import Controller from '@ember/controller';
import DS from 'ember-data';
import { computed } from '@ember/object';

export default Controller.extend({
  kindOptions: A(['select', 'numeric']),

  // Filter groups which are not associated with this chart type, but are in
  // the same game as this chart type
  otherFilterGroups: computed('model', function() {
    let chartType = this.model.chartType;
    let gameFilterGroupsPromise = this.get('store').query(
      'filter-group', {game_id: chartType.get('game').get('id')}
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
  }),

  actions: {
    onOrderChange(ctfg) {
      ctfg.save().then(() => {this.send('refreshRoute');});
    },

    onShowChange(ctfg, showByDefault) {
      ctfg.set('showByDefault', showByDefault);
      ctfg.save().then(() => {this.send('refreshRoute');});
    },
  },
});