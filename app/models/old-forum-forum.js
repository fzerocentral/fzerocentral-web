import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OldForumForumModel extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('number') order;

  @belongsTo('old-forum-category') category;
  @hasMany('old-forum-topic') topics;
}
