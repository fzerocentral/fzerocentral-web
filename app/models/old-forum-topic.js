import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OldForumTopicModel extends Model {
  @attr('string') title;
  @attr('boolean') hasPoll;
  @attr('boolean') isNews;
  @attr('number') status;
  @attr('number') importance;
  @attr('number') postCount;

  @belongsTo('old-forum-forum') forum;
  @belongsTo('old-forum-post') firstPost;
  @belongsTo('old-forum-post') lastPost;
  @hasMany('old-forum-post') posts;

  STATUS_OPTIONS = {
    UNLOCKED: 0,
    LOCKED: 1,
    MOVED: 2,
  };
  IMPORTANCE_OPTIONS = {
    NORMAL: 0,
    STICKY: 1,
    ANNOUNCEMENT: 2,
  };

  static POSTS_PER_PAGE = 20;

  get hasMultiplePages() {
    return this.pageCount > 1;
  }

  get icon() {
    if (this.importance === this.IMPORTANCE_OPTIONS.ANNOUNCEMENT) {
      return 'announcement';
    } else if (this.importance === this.IMPORTANCE_OPTIONS.STICKY) {
      return 'sticky';
    } else if (this.status === this.STATUS_OPTIONS.LOCKED) {
      return 'locked';
    }
    return 'normal';
  }

  get pageCount() {
    return Math.ceil(this.postCount / OldForumTopicModel.POSTS_PER_PAGE);
  }

  get replyCount() {
    return this.postCount - 1;
  }

  get titlePrefix() {
    let prefix = '';

    if (this.hasPoll) {
      prefix = '[ Poll ] ' + prefix;
    }

    if (this.isNews) {
      prefix = 'News: ' + prefix;
    } else if (this.importance === this.IMPORTANCE_OPTIONS.ANNOUNCEMENT) {
      prefix = 'Announcement: ' + prefix;
    } else if (this.importance === this.IMPORTANCE_OPTIONS.STICKY) {
      prefix = 'Sticky: ' + prefix;
    }

    return prefix;
  }
}
