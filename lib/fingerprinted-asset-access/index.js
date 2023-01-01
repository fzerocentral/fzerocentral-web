'use strict';

/* This in-repo addon allows the asset helper to work, by getting the mapping
 from asset filepaths to their fingerprinted versions.
 This is based off of ember-cli-ifa, but this version is 1) more bare-bones,
 2) dependent on the main app providing an initializer / service / helper, and
 3) uses Octane code.
 The reason we have an in-repo addon for this at all, is that there doesn't
 seem to be a main-app equivalent of the postBuild() hook. */

const fs = require('fs');
const path = require('path');

const addonName = require('./package').name;
const metaPlaceholder = '__AssetMapPlaceholder__';

function replacePlaceholder(filePath, assetMap) {
  const assetMapString = encodeURIComponent(JSON.stringify(assetMap));
  const fileBody = fs.readFileSync(filePath, { encoding: 'utf-8' });
  fs.writeFileSync(filePath, fileBody.replace(metaPlaceholder, assetMapString));
}

module.exports = {
  name: addonName,

  isDevelopingAddon() {
    return true;
  },

  contentFor(type) {
    if (type !== 'head') {
      return;
    }

    return `<meta name="asset-map" content="${metaPlaceholder}">`;
  },

  postBuild(buildResult) {
    // Find the asset-map-file in the assets dir.
    //
    // ember-cli-build.js must have fingerprint -> generateAssetMap
    // set to true, so that the file exists.

    const assetsDir = path.join(buildResult.directory, 'assets');
    const filenames = fs.readdirSync(assetsDir);

    let assetMapFilename = null;
    for (let filename of filenames) {
      // Just match 'assetMap', not 'assetMap.json', because this file
      // might be fingerprinted itself (if fingerprintAssetMap is true).
      if (filename.match(/^assetMap/i)) {
        assetMapFilename = filename;
        break;
      }
    }

    if (assetMapFilename === null) {
      // The asset map file won't be there after a development build.
      // Development doesn't need the asset map anyway since fingerprinting
      // is disabled in dev.
      return;
    }

    const assetMapFilepath = path.join(assetsDir, assetMapFilename);

    // Read the asset-map-file's content.

    let assetMapContent = fs.readFileSync(assetMapFilepath, {
      encoding: 'utf-8',
    });
    let assetMap = JSON.parse(assetMapContent);

    // Write the content into index.html.

    replacePlaceholder(
      path.join(buildResult.directory, 'index.html'),
      assetMap
    );

    // Write the content into tests/index.html, if it exists.

    let testIndexPath = path.join(buildResult.directory, 'tests', 'index.html');
    if (fs.existsSync(testIndexPath)) {
      replacePlaceholder(testIndexPath, assetMap);
    }
  },
};
