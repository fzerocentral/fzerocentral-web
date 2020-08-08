import Model, { attr, hasMany } from '@ember-data/model';

export default Model.extend({
  username: attr(),

  records: hasMany('record'),
});
