import { errorDisplay } from "../helpers/error-display";


export function getFormField(form, fieldName) {
  return Array.from(form.elements).find(
    (element) => element.name === fieldName);
}

export function setFormError(form, error) {
  form.querySelector('.error-message').textContent = errorDisplay([error]);
}
