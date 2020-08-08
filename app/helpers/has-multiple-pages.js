import DS from 'ember-data'; /* eslint-disable-line ember/use-ember-data-rfc-395-imports */ 

import { helper } from '@ember/component/helper';

export function hasMultiplePages(params) {
  let [paginatedResultsPromise] = params;

  return DS.PromiseObject.create({
    promise: paginatedResultsPromise.then((paginatedResults) => {
      // In some trivial cases, paginatedResults may be an empty
      // PromiseArray which we didn't bother adding a meta attribute to.
      if (!paginatedResults.meta) {return {value: false};}

      let paginationMeta = paginatedResults.meta.pagination;
      let totalResults = Number(paginationMeta.totalResults);
      let resultsPerPage = Number(paginationMeta.resultsPerPage);
      return {value: totalResults > resultsPerPage};
    })
  });
}

export default helper(hasMultiplePages);
