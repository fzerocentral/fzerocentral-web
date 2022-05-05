/*
This can be used in place of ember-data model instances in many cases.
Example usage:
let group = new DummyModel({ id: '1', name: 'G1', kind: 'select' });
let filter = new DummyModel({ id: '1', name: 'F1', filterGroup: group });
this.set('filterOptions', [filter]);
 */
export class DummyModel {
  constructor(propertiesHash) {
    for (let [key, value] of Object.entries(propertiesHash)) {
      this[key] = value;
    }
  }
  get(propName) {
    return this[propName];
  }
}

/*
This helper function doesn't really save any typing, but it's more about
remembering how to create models (e.g. as opposed to store.createRecord()) and
being able to change the implementation across the board easily.
 */
export function createModelInstance(server, modelName, args) {
  return server.create(modelName, args);
}
