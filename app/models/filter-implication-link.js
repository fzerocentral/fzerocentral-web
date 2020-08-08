import Model, { belongsTo } from '@ember-data/model';

export default Model.extend({
  implyingFilter: belongsTo('filter'),
  impliedFilter: belongsTo('filter'),
});
