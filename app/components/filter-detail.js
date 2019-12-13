import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
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
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implied_filter_id: filter.get('id'),
          page: this.get('incomingImplicationsPageNumber'),
        };
        return this.get('store').query('filterImplication', args);
      })
    });
  },

  @computed('filter', 'linksLastUpdated', 'outgoingImplicationsPageNumber')
  get outgoingImplications() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implying_filter_id: filter.get('id'),
          page: this.get('outgoingImplicationsPageNumber'),
        };
        return this.get('store').query('filterImplication', args);
      })
    });
  },

  @computed('filter', 'incomingLinksPageNumber', 'linksLastUpdated')
  get incomingLinks() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implied_filter_id: filter.get('id'),
          page: this.get('incomingLinksPageNumber'),
        };
        return this.get('store').query('filterImplicationLink', args);
      })
    });
  },

  @computed('filter', 'linksLastUpdated', 'outgoingLinksPageNumber')
  get outgoingLinks() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {
          implying_filter_id: filter.get('id'),
          page: this.get('outgoingLinksPageNumber'),
        };
        return this.get('store').query('filterImplicationLink', args);
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
    if (this.get('newLinkDirection') === null) {
      this.set(
        'linkCreateError', "Please select a link direction (from or to).");
      return;
    }
    if (this.get('newLinkOtherFilter') === null) {
      this.set(
        'linkCreateError', "Please select a filter to link to.");
      return;
    }

    let args = {};
    if (this.get('newLinkDirection') === "from") {
      args['implyingFilter'] = this.get('newLinkOtherFilter');
      args['impliedFilter'] = this.get('filter');
    }
    else {
      // "to"
      args['implyingFilter'] = this.get('filter');
      args['impliedFilter'] = this.get('newLinkOtherFilter');
    }

    let newLink = this.get('store').createRecord(
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
    if (this.get('selectedLinkDeletionOption') === null) {
      this.set(
        'linkDeleteError', "Please select a link to delete.");
      return;
    }

    let link = this.get('selectedLinkDeletionOption');

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
