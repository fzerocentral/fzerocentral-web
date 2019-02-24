import { run } from "@ember/runloop";

export function createModelInstance(server, modelName, args) {
  // This helper function doesn't really save any typing, but it's more about
  // remembering how to do this (e.g. as opposed to store.createRecord()) and
  // being able to change the implementation across the board easily.
  return server.create(modelName, args);
}

export function modelAsProperty(store, modelName, modelRecord) {
  // The result of server.create() is good for passing into another create()
  // call to specify a model relationship.
  // However, the result of server.create() doesn't have a function get(), so
  // it can't generally be passed as a component property, or the component
  // code will fail when it tries to call get() on the property. Need to call
  // findRecord() to get our hands on an object with get() available.
  //
  // Pass a server.create() result to this function as modelRecord, and this
  // function will return an object with get().
  return run(() => store.findRecord(modelName, modelRecord.id));
}
