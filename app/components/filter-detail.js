import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';


export default class FilterDetailComponent extends Component {
  @tracked filterEditError = null;
  @tracked isEditing = false;

  get hasNumericValue() {
    return this.args.filter.filterGroup.get('kind') === 'numeric';
  }

  get filterEditArgs() {
    let args = {};
    args.name = document.getElementById('edit-filter-name').value;
    if (this.hasNumericValue) {
      args.numericValue =
        document.getElementById('edit-filter-numeric-value').value;
    }
    return args;
  }

  get recordCount() {
    if (this.args.sampleRecords === null) {return null;}

    // The record count can be retrieved from the pagination headers of
    // sampleRecords. We're not interested in the records themselves.
    return this.args.sampleRecords.meta.pagination.count;
  }


  @action
  selectFilter(filterId) {
    this.args.updateFilterId(filterId);

    // Re-initialize some component state.
    this.filterEditError = null;
    this.stopEditing();
  }

  @action
  saveEdits() {
    this.args.editFilter(this.filterEditArgs)
    .then((errorMessage) => {
      if (errorMessage !== null) {
        // Success; close the edit form.
        this.stopEditing();
        this.filterEditError = null;
      }
      else {
        this.filterEditError = errorMessage;
      }
    });
  }

  @action
  startEditing() {
    this.isEditing = true;

    // Populate fields
    let filter = this.args.filter;
    document.getElementById('edit-filter-name').value =
      filter.get('name');
    if (this.hasNumericValue) {
      document.getElementById('edit-filter-numeric-value').value =
        filter.get('numericValue');
    }
  }

  @action
  stopEditing() {
    this.isEditing = false;
  }
}
