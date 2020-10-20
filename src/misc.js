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

/**
 * Returns the next index in the list of an item that is not disabled.
 *
 * @param {number} moveAmount Number of positions to move. Negative to move backwards,
 *                            positive forwards.
 * @param {number} baseIndex The initial position to move from.
 * @param {number} itemCount The total number of items.
 * @param {Function} getItemNodeFromIndex Used to check if item is disabled.
 * @param {boolean} circular Specify if navigation is circular. Default is true.
 * @returns {number} The new index. Returns baseIndex if item is not disabled.
 *                   Returns next non-disabled item otherwise. If no non-disabled found
 *                   it will return -1.
 */
export function getNextNonDisabledIndex(
  moveAmount,
  baseIndex,
  itemCount,
  getItemNodeFromIndex,
  circular,
) {
  const currentElementNode = getItemNodeFromIndex(baseIndex);
  if (!currentElementNode || !currentElementNode.hasAttribute('disabled')) {
    return baseIndex;
  }

  if (moveAmount > 0) {
    for (let index = baseIndex + 1; index < itemCount; index += 1) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  } else {
    for (let index = baseIndex - 1; index >= 0; index -= 1) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  }

  if (circular) {
    return moveAmount > 0
      ? getNextNonDisabledIndex(1, 0, itemCount, getItemNodeFromIndex, false)
      : getNextNonDisabledIndex(
        -1,
        itemCount - 1,
        itemCount,
        getItemNodeFromIndex,
        false,
      );
  }

  return -1;
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
