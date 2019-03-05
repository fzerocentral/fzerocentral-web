export function getURLSearchParamsHash(url) {
  let queryString = url.substring(url.indexOf('?'));
  let usp = new URLSearchParams(queryString);
  let paramsHash = {};
  for (let pair of usp.entries()) {
    paramsHash[pair[0]] = pair[1];
  }
  return paramsHash;
}
