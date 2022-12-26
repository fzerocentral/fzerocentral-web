import { htmlSafe } from '@ember/template';
import Model, { attr } from '@ember-data/model';

export default class OldForumPollModel extends Model {
  @attr('string') title;

  get titleDisplay() {
    return htmlSafe(this.title);
  }
}
