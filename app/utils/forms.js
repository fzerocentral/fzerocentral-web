import { errorDisplay } from "../helpers/error-display";


// TODO: Replace this with getFormValue() and a setFormValue(), because
//  this doesn't work or make sense with radio inputs, and usages all
//  amount to getting/setting the form value.
//  A function to get all form values using FormData would also be good.
export function getFormField(form, fieldName) {
  return Array.from(form.elements).find(
    (element) => element.name === fieldName);
}

export function getFormValue(form, fieldName) {
  let formElements = Array.from(form.elements);
  let field = formElements.find(
    (element) => element.name === fieldName);

  if (field.type === 'radio') {
    let checkedField = formElements.find(
      (element) => element.name === fieldName && element.checked);
    return checkedField.value;
  }
  else {
    return field.value;
  }
}

export function setFormError(form, error) {
  form.querySelector('.error-message').textContent = errorDisplay([error]);
}
