import Model, { attr, belongsTo } from '@ember-data/model';

export default class OldForumPostModel extends Model {
  @attr('string') subject;
  @attr('string') text;
  @attr('date') time;
  // For guest posts
  @attr('string') username;

  @belongsTo('old-forum-topic') topic;
  @belongsTo('old-forum-user') poster;
}
