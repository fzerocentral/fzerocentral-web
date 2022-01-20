import Model, { attr, belongsTo } from '@ember-data/model';

export default class ChartTypeFilterGroupModel extends Model {
  @attr('boolean') showByDefault;
  @attr('number') orderInChartType;

  @belongsTo('filter-group') filterGroup;
  @belongsTo('chart-type') chartType;
}
