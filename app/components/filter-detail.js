import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
import EmberObject, { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import fetch from 'fetch';


export default Component.extend({
  editableParams: EmberObject.create(),
  filterDeleteError: null,
  filterGroupId: null,
  filterId: null,
  implicationCreateError: null,
  implicationDeleteError: null,
  implicationsLastUpdated: null,
  incomingImplicationsPageNumber: 1,
  newImplicationTargetFilter: null,
  outgoingImplicationsPageNumber: 1,
  selectedImplicationDeletionOption: null,
  store: service('store'),
  isEditing: false,

  @computed('filterId')
  get filter() {
    let filterId = this.get('filterId');
    if (filterId === null) { return null; }

    return this.get('store').findRecord('filter', this.get('filterId'));
  },

  @computed('filterId')
  get recordCount() {
    let filterId = this.get('filterId');
    if (filterId === null) { return {value: ""}; }

    // The record count can be retrieved from the pagination headers of a
    // GET records response. We're not interested in the records themselves,
    // so we just request 1 record.
    let recordsPromise = this.get('store').query(
      'record', {filters: filterId.toString(), 'page[size]': 1});

    return DS.PromiseObject.create({
      promise: recordsPromise.then((records) => {
        return {value: records.meta.pagination.count};
      })
    });
  },

  @computed('filter', 'incomingImplicationsPageNumber', 'implicationsLastUpdated')
  get incomingImplications() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implies_filter_id: filter.get('id'),
          'page[number]': this.get('incomingImplicationsPageNumber'),
        };
        return this.get('store').query('filter', args);
      })
    });
  },

  @computed('filter', 'implicationsLastUpdated', 'outgoingImplicationsPageNumber')
  get outgoingImplications() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implied_by_filter_id: filter.get('id'),
          'page[number]': this.get('outgoingImplicationsPageNumber'),
        };
        return this.get('store').query('filter', args);
      })
    });
  },


  didUpdateAttrs() {
    // Re-initialize the component state when the filter selection changes.
    this.set('filterDeleteError', null);
    this.set('implicationCreateError', null);
    this.set('implicationDeleteError', null);
    this.set('incomingImplicationsPageNumber', 1);
    this.set('newImplicationTargetFilter', null);
    this.set('outgoingImplicationsPageNumber', 1);
    this.set('selectedImplicationDeletionOption', null);
    this.send('stopEditing');
  },


  @action
  createImplication() {
    let targetFilter = this.get('newImplicationTargetFilter');
    if (targetFilter === null) {
      this.set(
        'implicationCreateError',
        "Please select the target filter for the implication relation.");
      return;
    }

    // Not sure if this sort of 'add relationship' request is supported by
    // Ember Data, so just using fetch() here.
    let implicationRelationshipUrl =
      `/filters/${this.filterId}/relationships/outgoing_filter_implications/`;
    fetch(implicationRelationshipUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        'data': [{'type': 'filters', 'id': targetFilter.get('id')}]
      }),
    })
    .then(response => response.json())
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      this.set('implicationCreateError', null);

      // Reset the target-filter field.
      this.set('newImplicationTargetFilter', null);
      // Refresh implication-related computed properties by changing this
      // property.
      this.set('implicationsLastUpdated', new Date());
    })
    .catch(error => {
      this.set('implicationCreateError', error.message);
    });
  },

  @action
  deleteImplication() {
    let targetFilter = this.get('selectedImplicationDeletionOption');
    if (targetFilter === null) {
      this.set(
        'implicationDeleteError', "Please select an implication to delete.");
      return;
    }

    // Not sure if this sort of 'delete relationship' request is supported by
    // Ember Data, so just using fetch() here.
    let implicationRelationshipUrl =
      `/filters/${this.filterId}/relationships/outgoing_filter_implications/`;
    fetch(implicationRelationshipUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        'data': [{'type': 'filters', 'id': targetFilter.get('id')}]
      }),
    })
    .then(response => response.json())
    .then(data => {
      if ('errors' in data) {
        throw new Error(data.errors[0].detail);
      }

      this.set('implicationDeleteError', null);

      // Reset the implication field.
      this.set('selectedImplicationDeletionOption', null);
      // Refresh implication-related computed properties by changing this
      // property.
      this.set('implicationsLastUpdated', new Date());
    })
    .catch(error => {
      this.set('implicationDeleteError', error.message);
    });
  },

  @action
  deleteFilter() {
    // filter is a promise. Need to unwrap the promise to get the underlying
    // DS.Model and call destroyRecord() on it.
    this.get('filter').then((filter) => {
      return filter.destroyRecord();
    }).then(() => {
      // Success callback
      this.set('filterDeleteError', null);
      // When done destroying, clear the active filter ID.
      this.set('filterId', null);
    }, (response) => {
      // Error callback
      this.set('filterDeleteError', response.errors[0]);
    });
  },

  @action
  saveEdits() {
    let params = this.get('editableParams');
    // filter is a promise. Need to unwrap the promise to get the underlying
    // DS.Model and call save() on it.
    this.get('filter').then((filter) => {
      filter.set('name', params.name);
      filter.set('numericValue', params.numericValue);
      return filter.save();
    }).then(() => {
      // When done saving, close the edit form.
      this.send('stopEditing');
    });
  },

  @action
  startEditing() {
    this.set('isEditing', true);

    // Populate fields
    let params = this.get('editableParams');
    let filter = this.get('filter');
    params.set('name', filter.get('name'));
    params.set('numericValue', filter.get('numericValue'));
  },

  @action
  stopEditing() {
    this.set('isEditing', false);
  },
});
