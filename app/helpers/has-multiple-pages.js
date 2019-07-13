import DS from 'ember-data';
import { helper } from '@ember/component/helper';

export function hasMultiplePages(params) {
  let [paginatedResultsPromise] = params;

  return DS.PromiseObject.create({
    promise: paginatedResultsPromise.then((paginatedResults) => {
      let paginationMeta = paginatedResults.meta.pagination;
      let totalResults = Number(paginationMeta.totalResults);
      let resultsPerPage = Number(paginationMeta.resultsPerPage);
      return {value: totalResults > resultsPerPage};
    })
  });
}

export default helper(hasMultiplePages);
