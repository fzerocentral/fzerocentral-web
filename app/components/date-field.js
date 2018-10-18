import Component from '@ember/component';
import moment from 'moment';

export default Component.extend({
  init() {
    this._super(...arguments);

    let dateValue = this.get('dateValue');
    if (dateValue !== null && dateValue !== undefined) {
      // Date to string
      this.set('strValue', moment(dateValue).format());
    }
  },

  actions: {
    onchange() {
      // String to date
      // TODO: Have error checking here
      this.set('dateValue', moment(this.get('strValue')).toDate());
    },
  }
});
