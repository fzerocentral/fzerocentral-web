import Model, { attr, hasMany } from '@ember-data/model';

export default class OldForumCategoryModel extends Model {
  @attr('string') title;
  @attr('number') order;

  @hasMany('old-forum-forum') forums;
}
