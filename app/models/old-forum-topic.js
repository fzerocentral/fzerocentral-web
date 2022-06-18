import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OldForumTopicModel extends Model {
  @attr('string') title;

  @belongsTo('old-forum-forum') forum;
  @hasMany('old-forum-post') posts;
}
