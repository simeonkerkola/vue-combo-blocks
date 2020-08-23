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

export function requiredProp(fnName, propName) {
  // eslint-disable-next-line no-console
  console.error(`The property "${propName}" is required in "${fnName}"`);
}
