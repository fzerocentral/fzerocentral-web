import { A } from '@ember/array';
import Component from '@ember/component';
import DS from 'ember-data';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  editableParams: EmberObject.create(),
  filterDeleteError: null,
  filterId: null,
  linkCreateError: null,
  linkDeleteError: null,
  linksLastUpdated: null,
  linkDirectionOptions: A(["from", "to"]),
  newLinkDirection: null,
  newLinkOtherFilter: null,
  selectedLinkDeletionOption: null,
  store: service('store'),


  filter: computed('filterId', function() {
    let filterId = this.get('filterId');
    if (filterId === null) { return null; }

    return this.get('store').findRecord('filter', this.get('filterId'));
  }),

  incomingImplications: computed('filter', 'linksLastUpdated', function() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {implied_filter_id: filter.get('id')};
        return this.get('store').query('filterImplication', args);
      })
    });
  }),

  outgoingImplications: computed('filter', 'linksLastUpdated', function() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {implying_filter_id: filter.get('id')};
        return this.get('store').query('filterImplication', args);
      })
    });
  }),

  incomingLinks: computed('filter', 'linksLastUpdated', function() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {implied_filter_id: filter.get('id')};
        return this.get('store').query('filterImplicationLink', args);
      })
    });
  }),

  outgoingLinks: computed('filter', 'linksLastUpdated', function() {
    return DS.PromiseArray.create({
      promise: this.get('filter').then((filter) => {
        if (filter === null) { return A([]); }

        let args = {implying_filter_id: filter.get('id')};
        return this.get('store').query('filterImplicationLink', args);
      })
    });
  }),

  linkDeletionOptions: computed('incomingLinks', 'outgoingLinks', function() {
    let options = A([]);

    this.get('incomingLinks').then((incomingLinks) => {
      incomingLinks.forEach((link) => {
        options.pushObject({
          'display': "from " + link.get('implyingFilter').get('name'),
          'link': link,
        });
      });
    });

    this.get('outgoingLinks').then((outgoingLinks) => {
      outgoingLinks.forEach((link) => {
        options.pushObject({
          'display': "to " + link.get('impliedFilter').get('name'),
          'link': link,
        });
      });
    });

    return options;
  }),


  didUpdateAttrs() {
    // Re-initialize the component state when the filter selection changes.
    this.set('filterDeleteError', null);
    this.set('linkCreateError', null);
    this.set('linkDeleteError', null);
    this.set('newLinkDirection', null);
    this.set('newLinkOtherFilter', null);
    this.set('selectedLinkDeletionOption', null);
    this.send('stopEditing');
  },


  actions: {
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

    deleteLink() {
      if (this.get('selectedLinkDeletionOption') === null) {
        this.set(
          'linkDeleteError', "Please select a link to delete.");
        return;
      }

      let link = this.get('selectedLinkDeletionOption')['link'];

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

    startEditing() {
      document.querySelector('div.filter-edit-form').classList.remove('hidden');
      document.querySelector('div.filter-basic-fields').classList.add('hidden');

      // Populate fields
      let params = this.get('editableParams');
      let filter = this.get('filter');
      params.set('name', filter.get('name'));
      params.set('numericValue', filter.get('numericValue'));
    },

    stopEditing() {
      document.querySelector('div.filter-basic-fields')
        .classList.remove('hidden');
      document.querySelector('div.filter-edit-form').classList.add('hidden');
    },
  },
});
