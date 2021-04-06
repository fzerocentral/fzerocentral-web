import Model, { belongsTo } from '@ember-data/model';

export default class FilterImplicationLinkModel extends Model {
  @belongsTo('filter') implyingFilter;
  @belongsTo('filter') impliedFilter;
}
