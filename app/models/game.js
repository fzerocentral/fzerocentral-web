import Model, { attr, hasMany } from '@ember-data/model';

export default class GameModel extends Model {
  @attr('string') name;
  @attr('string') shortCode;

  @hasMany('chart-type') chartTypes;
}

export function getGameByShortCode(store, shortCode) {
  return store
    .query('game', {
      short_code: shortCode,
    })
    .then((games) => {
      return games.objectAt(0);
    });
}
