export const controls = {
  arrowUpKey: 38,
  arrowDownKey: 40,
  escKey: 27,
  enterKey: 13,
  showList: 40,
};

export function hasKeyCode(keyCode, event) {
  return keyCode === event.keyCode;
}

export function getItemIndex(index, item, items) {
  if (index !== undefined) {
    return index;
  }
  if (!items.length) {
    return -1;
  }
  return items.indexOf(item);
}

export function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function requiredProp(fnName, propName) {
  // eslint-disable-next-line no-console
  console.error(`The property "${propName}" is required in "${fnName}"`);
}

// export function scrollToElement(element, parentElement, hoveredIndex) {
//   console.log({ element, parentElement, hoveredIndex });
//   /* eslint-disable no-param-reassign */
//   const { clientHeight, scrollTop } = parentElement;
//   const { offsetHeight, offsetTop } = element;

//   console.log('parent', { clientHeight, scrollTop });
//   console.log('element', { offsetHeight, offsetTop });

//   if (offsetTop < scrollTop) {
//     // If scrolled down past the last item, scroll all the way to the top
//     console.log('up');
//     if (hoveredIndex === 0) parentElement.scrollTop = 0;
//     else parentElement.scrollTop = offsetTop; // scroll up
//   } else {
//     const offsetBottom = offsetTop + offsetHeight;
//     const scrollBottom = scrollTop + clientHeight;
//     if (offsetBottom > scrollBottom) {
//       console.log('down');
//       parentElement.scrollTop = offsetBottom - clientHeight; // scroll down
//     }
//   }
//   console.log({ 'parentElement.scrollTop': parentElement.scrollTop });

// /* eslint-enable no-param-reassign */
// }
