import Model, { attr, hasMany } from '@ember-data/model';

export default class OldForumUserModel extends Model {
  @attr('string') username;
  @attr('number') postCount;
  @attr('number') level;

  @hasMany('old-forum-post') posts;

  static LEVEL_OPTIONS = {
    REGULAR: 0,
    ADMIN: 1,
    MOD: 2,
  };
}
