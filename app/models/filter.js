import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FilterModel extends Model {
  @attr('string') name;
  @attr('string') usageType;
  // Used when the filterGroup is numeric
  @attr('number') numericValue;

  @belongsTo('filter-group') filterGroup;
  @hasMany('record') records;

  @hasMany('filter', {
    inverse: 'incomingFilterImplications',
  })
  outgoingFilterImplications;
  @hasMany('filter', {
    inverse: 'outgoingFilterImplications',
  })
  incomingFilterImplications;

  static USAGE_TYPE_OPTIONS = ['choosable', 'implied'];
}
