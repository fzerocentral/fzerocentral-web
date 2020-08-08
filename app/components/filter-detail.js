import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data'; /* eslint-disable-line ember/use-ember-data-rfc-395-imports */ 

import EmberObject, { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  editableParams: EmberObject.create(),
  filterDeleteError: null,
  filterGroupId: null,
  filterId: null,
  incomingImplicationsPageNumber: 1,
  incomingLinksPageNumber: 1,
  linkCreateError: null,
  linkDeleteError: null,
  linksLastUpdated: null,
  linkDirectionOptions: A(["from", "to"]),
  newLinkDirection: null,
  newLinkOtherFilter: null,
  outgoingImplicationsPageNumber: 1,
  outgoingLinksPageNumber: 1,
  selectedLinkDeletionOption: null,
  store: service('store'),
  isEditing: false,

  @computed('filterId')
  get filter() {
    let filterId = this.filterId;
    if (filterId === null) { return null; }

    return this.store.findRecord('filter', this.filterId);
  },

  @computed('filterId')
  get recordCount() {
    let filterId = this.filterId;
    if (filterId === null) { return {value: ""}; }

    // The record count can be retrieved from the pagination headers of a
    // GET records response. We're not interested in the records themselves,
    // so we just request 1 record.
    let recordsPromise = this.store.query(
      'record', {filters: filterId.toString(), per_page: 1});

    return DS.PromiseObject.create({
      promise: recordsPromise.then((records) => {
        return {value: records.meta.pagination.totalResults};
      })
    });
  },

  @computed('filter', 'incomingImplicationsPageNumber', 'linksLastUpdated')
  get incomingImplications() {
    return DS.PromiseArray.create({
      promise: this.filter.then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implied_filter_id: filter.get('id'),
          page: this.incomingImplicationsPageNumber,
        };
        return this.store.query('filterImplication', args);
      })
    });
  },

  @computed('filter', 'linksLastUpdated', 'outgoingImplicationsPageNumber')
  get outgoingImplications() {
    return DS.PromiseArray.create({
      promise: this.filter.then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implying_filter_id: filter.get('id'),
          page: this.outgoingImplicationsPageNumber,
        };
        return this.store.query('filterImplication', args);
      })
    });
  },

  @computed('filter', 'incomingLinksPageNumber', 'linksLastUpdated')
  get incomingLinks() {
    return DS.PromiseArray.create({
      promise: this.filter.then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implied_filter_id: filter.get('id'),
          page: this.incomingLinksPageNumber,
        };
        return this.store.query('filterImplicationLink', args);
      })
    });
  },

  @computed('filter', 'linksLastUpdated', 'outgoingLinksPageNumber')
  get outgoingLinks() {
    return DS.PromiseArray.create({
      promise: this.filter.then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implying_filter_id: filter.get('id'),
          page: this.outgoingLinksPageNumber,
        };
        return this.store.query('filterImplicationLink', args);
      })
    });
  },


  didUpdateAttrs() {
    // Re-initialize the component state when the filter selection changes.
    this.set('filterDeleteError', null);
    this.set('incomingImplicationsPageNumber', 1);
    this.set('incomingLinksPageNumber', 1);
    this.set('linkCreateError', null);
    this.set('linkDeleteError', null);
    this.set('newLinkDirection', null);
    this.set('newLinkOtherFilter', null);
    this.set('outgoingImplicationsPageNumber', 1);
    this.set('outgoingLinksPageNumber', 1);
    this.set('selectedLinkDeletionOption', null);
    this.send('stopEditing');
  },


  @action
  createLink() {
    if (this.newLinkDirection === null) {
      this.set(
        'linkCreateError', "Please select a link direction (from or to).");
      return;
    }
    if (this.newLinkOtherFilter === null) {
      this.set(
        'linkCreateError', "Please select a filter to link to.");
      return;
    }

    let args = {};
    if (this.newLinkDirection === "from") {
      args['implyingFilter'] = this.newLinkOtherFilter;
      args['impliedFilter'] = this.filter;
    }
    else {
      // "to"
      args['implyingFilter'] = this.filter;
      args['impliedFilter'] = this.newLinkOtherFilter;
    }

    let newLink = this.store.createRecord(
      'filterImplicationLink', args);

    // Save the link
    newLink.save().then(() => {
      // Success callback
      this.set('linkCreateError', null);

      // Reset the other-filter field. We won't reset the link-direction
      // field, because the user might want to add several "From" links in
      // a row, for example.
      this.set('newLinkOtherFilter', null);
      // Refresh link-related computed properties by changing this property.
      this.set('linksLastUpdated', new Date());
    }, (response) => {
      // Error callback
      this.set('linkCreateError', response.errors[0]);
    });
  },

  @action
  deleteLink() {
    if (this.selectedLinkDeletionOption === null) {
      this.set(
        'linkDeleteError', "Please select a link to delete.");
      return;
    }

    let link = this.selectedLinkDeletionOption;

    link.destroyRecord().then(() => {
      // Success callback
      this.set('linkDeleteError', null);

      // Reset the link field.
      this.set('selectedLinkDeletionOption', null);
      // Refresh link-related computed properties by changing this property.
      this.set('linksLastUpdated', new Date());
    }, (response) => {
      // Error callback
      this.set('linkDeleteError', response.errors[0]);
    });
  },

  @action
  deleteFilter() {
    // filter is a promise. Need to unwrap the promise to get the underlying
    // DS.Model and call destroyRecord() on it.
    this.filter.then((filter) => {
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
    let params = this.editableParams;
    // filter is a promise. Need to unwrap the promise to get the underlying
    // DS.Model and call save() on it.
    this.filter.then((filter) => {
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
    let params = this.editableParams;
    let filter = this.filter;
    params.set('name', filter.get('name'));
    params.set('numericValue', filter.get('numericValue'));
  },

  @action
  stopEditing() {
    this.set('isEditing', false);
  },
});
