import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OldForumTopicModel extends Model {
  @attr('string') title;
  @attr('boolean') hasPoll;
  @attr('boolean') isNews;
  @attr('number') status;
  @attr('number') importance;

  @belongsTo('old-forum-forum') forum;
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