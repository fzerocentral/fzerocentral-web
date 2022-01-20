import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FilterModel extends Model {
  @attr('string') name;
  // 'choosable' or 'implied'
  // TODO: This can't be specified as attr('string'), or a
  // Unit | Route | filter-groups/show test will break. Perhaps the value is
  // set to null in some case? If so, that probably shouldn't be allowed
  // for the sake of simplicity / consistency with other models.
  @attr() usageType;
  // Used when the filterGroup is numeric
  @attr('number') numericValue;

  @belongsTo('filter-group') filterGroup;
  @hasMany('record') records;
}



// import DS from 'ember-data';
//
// export default DS.Model.extend({
//   name: DS.attr(),
//   // 'choosable' or 'implied'
//   usageType: DS.attr(),
//   // Used when the filterGroup is numeric
//   numericValue: DS.attr(),
//
//   filterGroup: DS.belongsTo('filter-group'),
//   records: DS.hasMany('record'),
// });
