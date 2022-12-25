import Model, { attr, belongsTo } from '@ember-data/model';
import OldForumUserModel from './old-forum-user';

export default class OldForumPostModel extends Model {
  @attr('string') subject;
  @attr('string') text;
  @attr('date') time;
  @attr('date') editTime;
  // For guest posts
  @attr('string') username;

  @belongsTo('old-forum-topic', { inverse: 'posts' }) topic;
  @belongsTo('old-forum-user') poster;

  get posterName() {
    if (this.poster.get('id')) {
      return this.poster.get('username');
    }
    // Null poster
    return this.username;
  }

  get posterTitle() {
    if (this.poster.get('id')) {
      if (this.poster.get('level') === OldForumUserModel.LEVEL_OPTIONS.ADMIN) {
        return 'Admin';
      }
      if (this.poster.get('level') === OldForumUserModel.LEVEL_OPTIONS.MOD) {
        return 'Mod';
      }
      return '';
    }
    // Null poster
    return 'Guest';
  }
}
