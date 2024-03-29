import { htmlSafe } from '@ember/template';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class OldForumPollOptionModel extends Model {
  @attr('string') text;
  @attr('number') voteCount;

  @belongsTo('old-forum-poll') poll;
  @attr('number') optionNumber;

  get textDisplay() {
    return htmlSafe(this.text);
  }
}
