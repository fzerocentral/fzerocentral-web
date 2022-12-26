import { helper } from '@ember/component/helper';
import config from 'fzerocentral-web/config/environment';

export default helper(function imageAsset(relativePath) {
  return `${config.rootURL}assets/images/${relativePath}`;
});
