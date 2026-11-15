/**
 * Small shared routing state. When a page sends the visitor back to the home page to a given section
 * (e.g. the inquiry form), Root scrolls there instead of restoring the previous position.
 */
export const route = { anchor: '' }

export function goHome(anchor = '') {
  route.anchor = anchor
  window.location.hash = '#/'
}
