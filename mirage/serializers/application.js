import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  // https://github.com/samselikoff/ember-cli-mirage/issues/1204
  alwaysIncludeLinkageData: true,
});
