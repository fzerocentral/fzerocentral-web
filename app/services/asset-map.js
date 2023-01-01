import Service from '@ember/service';
import config from '../config/environment';

export default class AssetMapService extends Service {
  map = {};

  /* Need to not only map unfingerprinted filenames to fingerprinted ones,
   but also fingerprinted filenames to themselves. This handles the cases
   where Ember's base fingerprinting functionality DOES activate
   (non-dynamic paths). */
  get fullMap() {
    const ret = {};

    Object.keys(this.map).forEach((k) => {
      const v = this.map[k];
      ret[k] = v;
      ret[v] = v;
    });
    return ret;
  }

  /* This should be called by the asset-map instance initializer. */
  setAssets(assets) {
    this.map = assets;
  }

  resolve(name) {
    if (config.environment !== 'production') {
      // No asset map in dev mode or tests.
      return name;
    }

    return this.fullMap[name];
  }
}
