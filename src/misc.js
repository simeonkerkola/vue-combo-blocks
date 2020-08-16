export const controls = {
  arrowUpKey: 38,
  arrowDownKey: 40,
  escKey: 27,
  enterKey: 13,
  showList: 40,
};

// export const modes = {
//   input: String,
//   select: Object,
// };

// export function fromPath(obj, path) {
//   return path.split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
// }

// export function hasKeyCodeByCode(arr, keyCode) {
//   if (arr.length <= 0) return false;

//   const has = (nestedArr) => nestedArr.some((code) => code === keyCode);
//   if (Array.isArray(arr[0])) {
//     return arr.some((array) => has(array));
//   }
//   return has(arr);
// }

export function hasKeyCode(keyCode, event) {
  return keyCode === event.keyCode;
}

export function getItemIndex(index, item, items) {
  if (index !== undefined) {
    return index;
  }
  if (items.length === 0) {
    return -1;
  }
  return items.indexOf(item);
}

export function requiredProp(fnName, propName) {
  // eslint-disable-next-line no-console
  console.error(`The property "${propName}" is required in "${fnName}"`);
}
