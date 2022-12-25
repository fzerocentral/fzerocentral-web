import Model, { attr, belongsTo } from '@ember-data/model';

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
      return '';
    }
    // Null poster
    return 'Guest';
  }
}
