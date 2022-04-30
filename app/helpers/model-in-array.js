import { helper } from '@ember/component/helper';

export function modelInArray([model, modelArray]) {
  let modelArrayIds = modelArray.map((model_) => model_.id);
  return modelArrayIds.includes(model.id);
}

export default helper(modelInArray);
