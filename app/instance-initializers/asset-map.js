import config from '../config/environment';

export function initialize(owner) {
  if (config.environment !== 'production') {
    // No asset map in dev mode or tests.
    return;
  }

  // The in-repo addon should have filled this meta tag with the
  // asset map's content. Grab that content.
  let metaTag = document.querySelector("meta[name='asset-map']");
  let assetMapData = JSON.parse(decodeURIComponent(metaTag.content));

  // Then pass that content to the assetMap service.
  let assetMap = owner.lookup('service:asset-map');
  assetMap.setAssets(assetMapData.assets);
}

export default {
  initialize,
};
