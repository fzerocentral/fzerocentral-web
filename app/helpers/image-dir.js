import { helper } from '@ember/component/helper';
import config from 'fzerocentral-web/config/environment';

export default helper(function imageDir() {
  return `${config.rootURL}assets/images/`;
});
