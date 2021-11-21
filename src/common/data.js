export default (item, itemToString) => ({
  hovered: null,
  isOpen: false,
  hoveredIndex: -1,
  selectedItem: item,
  inputValue: itemToString(item),
});
