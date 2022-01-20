import Model, { attr, hasMany } from '@ember-data/model';

export default class FilterGroupModel extends Model {
  @attr('string') name;
  // 'select' or 'numeric' - denoting the group's filters should be multiple
  // choice selected, or entered as a number
  @attr('string') kind;
  @attr('string') description;

  // Chart-type-specific attribute
  @attr('boolean') showByDefault;

  @hasMany('filter') filters;
  @hasMany('chart-type') chartTypes;
}
