import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FilterModel extends Model {
  @attr('string') name;
  // TODO: This can't be specified as attr('string'), or a
  // Unit | Route | filter-groups/show test will break. Perhaps the value is
  // set to null in some case? If so, that probably shouldn't be allowed
  // for the sake of simplicity / consistency with other models.
  @attr() usageType;
  // Used when the filterGroup is numeric
  @attr('number') numericValue;

  @belongsTo('filter-group') filterGroup;
  @hasMany('record') records;

  @hasMany('filter', {
    inverse: 'incomingFilterImplications'}) outgoingFilterImplications;
  @hasMany('filter', {
    inverse: 'outgoingFilterImplications'}) incomingFilterImplications;

  static USAGE_TYPE_OPTIONS = ['choosable', 'implied'];
}
