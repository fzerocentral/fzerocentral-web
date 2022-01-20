import Model, { attr, hasMany } from '@ember-data/model';

export default class PlayerModel extends Model {
  @attr('string') username;

  @hasMany('record') records;
}
