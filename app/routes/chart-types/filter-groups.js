import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import window from 'ember-window-mock';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      chartType: this.get('store').findRecord(
        'chart-type', params.chart_type_id),
      chartTypeFilterGroups: this.get('store').query(
        'chart-type-filter-group', {chart_type_id: params.chart_type_id}),
      filterGroups: this.get('store').query(
        'filterGroup', {chart_type_id: params.chart_type_id}),
      game: this.get('store').queryRecord(
        'game', {chart_type_id: params.chart_type_id}),
      newFilterGroup: this.get('store').createRecord('filter-group'),
      // Filter groups which are not associated with any chart type. These
      // aren't supposed to exist, but mistakes happen, so we check for these.
      orphanedFilterGroups: this.get('store').query(
        'filter-group', {chart_type_id: null}),
    });
  },

  actions: {
    createFilterGroup() {
      let newFilterGroup = this.modelFor(this.routeName).newFilterGroup;

      // Save the filter group
      newFilterGroup.save().then(() => {
        // Save the chart type - filter group link
        let chartType = this.modelFor(this.routeName).chartType;
        let chartTypeFilterGroup =
          this.get('store').createRecord(
            'chart-type-filter-group',
            {chartType: chartType, filterGroup: newFilterGroup});
        return chartTypeFilterGroup.save();

      }).then(() => {
        // Refresh the model (including current linked filter groups + the
        // new filter group tied to the UI fields)
        this.refresh();
      });
    },

    linkFilterGroup(filterGroup) {
      // Save the chart type - filter group link
      let chartType = this.modelFor(this.routeName).chartType;
      let chartTypeFilterGroup =
        this.get('store').createRecord(
          'chart-type-filter-group',
          {chartType: chartType, filterGroup: filterGroup});
      chartTypeFilterGroup.save().then(() => {
        // Refresh the model (including current linked filter groups + the
        // new filter group tied to the UI fields)
        this.refresh();
      });
    },

    refreshRoute() {
      this.refresh();
    },

    unlinkFilterGroup(ctfg) {

      let filterGroupId = ctfg.get('filterGroup').get('id');
      let chartTypesOfFilterGroupPromise = this.get('store').query(
        'chartType', {filter_group_id: filterGroupId});
      let shouldDeleteFilterGroup = false;

      chartTypesOfFilterGroupPromise.then((chartTypesOfFilterGroup) => {
        if (chartTypesOfFilterGroup.get('length') <= 1) {
          // The filter group will no longer be associated with any chart types
          // when this link is deleted. We don't want orphan filter groups, so
          // we want to delete the filter group in this case. Make sure that's
          // OK with the user.
          if (window.confirm(
            "The filter group will be deleted since it's not linked to any"
            + " other chart types. OK?")) {
            shouldDeleteFilterGroup = true;
          }
          else {
            throw new Error("User canceled deletion");
          }
        }

        // Delete the chart type - filter group link.
        return ctfg.destroyRecord();

      }).then(() => {
        // reload: true prevents a console error like "Attempted to handle
        // event `pushedData` on ... while in state root.deleted.saved"
        // which would otherwise happen when we delete this filter group.
        // https://stackoverflow.com/a/39232642/
        return this.get('store').findRecord(
          'filter-group', filterGroupId, { reload: true });

      }).then((filterGroup) => {
        if (shouldDeleteFilterGroup) {
          // Delete the filter group, then refresh the model.
          return filterGroup.destroyRecord().then(() => {
            this.refresh();
          });
        }
        else {
          // Refresh the model.
          this.refresh();
        }

      }).catch((error) => {
        if (error.message === "User canceled deletion") {
          // We just wanted to break from the Promise chain in this case. No
          // further handling needed.
          return;
        }
        throw error;
      });
    },

    willTransition() {
      // rollbackAttributes() removes the record from the store
      // if the model 'isNew'
      this.modelFor(this.routeName).newFilterGroup.rollbackAttributes();
    }
  }
});
