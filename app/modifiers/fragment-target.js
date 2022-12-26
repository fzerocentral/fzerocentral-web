import { modifier } from 'ember-modifier';

export default modifier(function fragmentTarget(
  element /*, positional, named*/
) {
  let anchorName = element.getAttribute('name');
  let urlFragment = window.location.hash.split('#').at(-1);
  if (anchorName === urlFragment) {
    element.scrollIntoView();
  }
});
