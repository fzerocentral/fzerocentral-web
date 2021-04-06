import Model, { belongsTo } from '@ember-data/model';

export default class FilterImplicationModel extends Model {
  @belongsTo('filter') implyingFilter;
  @belongsTo('filter') impliedFilter;
}
