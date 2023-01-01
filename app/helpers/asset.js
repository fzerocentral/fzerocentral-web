import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import config from '../config/environment';

/* In production, Ember automatically transforms asset filepaths into
 fingerprinted ones, but this only works when the filepath is written in a
 static way. If it's dynamic (e.g. 'images/' + topic.status + '.png') then
 the filepaths aren't transformed.

 This helper gives the fingerprinted version of an asset filepath, even if
 the filepath is computed dynamically. The input path can either be
 fingerprinted or unfingerprinted.

 This helper also automatically adds config.rootURL, so that the caller doesn't
 need to grab that variable. */
export default class AssetHelper extends Helper {
  @service assetMap;

  compute(relativePath) {
    return config.rootURL + this.assetMap.resolve(`assets/${relativePath}`);
  }
}
