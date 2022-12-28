import { modifier } from 'ember-modifier';

export default modifier(function fragmentTarget(
  element /*, positional, named*/
) {
  // 'Anchor' refers to the fragment's anchor element, not necessarily
  // an <a> element.
  let anchorId = element.id;
  let urlFragment = window.location.hash.split('#').at(-1);
  if (anchorId === urlFragment) {
    element.scrollIntoView();
  }
});
