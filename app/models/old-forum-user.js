import Model, { attr, hasMany } from '@ember-data/model';

export default class OldForumUserModel extends Model {
  @attr('string') username;

  @hasMany('old-forum-post') posts;
}
