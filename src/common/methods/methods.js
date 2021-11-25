import * as sct from '../../stateChangeTypes';
import {
  controls,
  hasKeyCode,
  getNextNonDisabledIndex,
  scrollToElement,
} from '../../utils';
import inputPropsAndListeners from './inputPropsAndListeners';
import itemPropsAndListeners from './itemPropsAndListeners';
import menuPropsAndListeners from './menuPropsAndListeners';

export default {
  ...inputPropsAndListeners,
  ...itemPropsAndListeners,
  ...menuPropsAndListeners,
  getComboboxProps() {
    return {
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-owns': this.computedMenuId,
      'aria-expanded': this.isOpen ? 'true' : 'false',
    };
  },
  getLabelProps() {
    return {
      id: this.computedLabelId,
      for: this.computedInputId,
    };
  },
  autocompleteText(item) {
    this.setInputValue(this.itemToString(item));
  },
  reset() {
    this.setState({
      selectedItem: null,
      inputValue: '',
    }, sct.FunctionReset);
  },
  select(item) {
    this.setState({
      inputValue: this.itemToString(item),
      selectedItem: item,
      isOpen: false,
      hoveredIndex: -1,
      hovered: null,
    }, sct.FunctionSelectItem);
  },
  setHoveredItem(item, index, elem) {
    if (item && item !== this.hovered) {
      this.$emit('hover', item, elem);
    }
    this.hovered = item;
    this.hoveredIndex = typeof index === 'number' ? index : -1;
  },
  closeMenu() {
    this.setState({
      isOpen: false,
      hoveredIndex: -1,
      hovered: null,
    }, sct.FunctionCloseMenu);
  },
  openMenu() {
    this.setState({
      isOpen: true,
    }, sct.FunctionOpenMenu);
  },
  getItemNodeFromIndex(index) {
    return this.menuElement.querySelector(`#${this.getItemId(index)}`);
  },
  scrollItemIntoView(index) {
    const itemElement = this.getItemNodeFromIndex(index);
    scrollToElement(itemElement, this.menuElement, index);
  },

  moveSelection(e) {
    const itemCount = this.items.length;
    if (!this.isOpen || !itemCount) return;
    const isMovingDown = hasKeyCode(controls.arrowDownKey, e);
    const isMovingUp = hasKeyCode(controls.arrowUpKey, e);
    if (isMovingDown || isMovingUp) {
      e.preventDefault();
      const direction = isMovingDown * 2 - 1;
      const menuEdge = isMovingDown ? 0 : itemCount - 1;
      const hoversBetweenEdges = isMovingDown
        ? this.hoveredIndex < itemCount - 1
        : this.hoveredIndex > 0;

      const index = hoversBetweenEdges ? this.hoveredIndex + direction : menuEdge;
      const nextIndex = getNextNonDisabledIndex(
        direction,
        index,
        itemCount,
        this.getItemNodeFromIndex,
        this.circular,
      );
      if (!this.circular) {
        if (isMovingUp && nextIndex > this.hoveredIndex) return;
        if (isMovingDown && nextIndex < this.hoveredIndex) return;
      }
      const item = this.items[nextIndex];

      if (this.scrollIntoView) {
        this.$nextTick(() => {
          this.scrollItemIntoView(index);
        });
      }
      this.setState({
        hoveredIndex: nextIndex,
        hovered: item,
      }, isMovingDown ? sct.InputKeyDownArrowDown : sct.InputKeyDownArrowUp);
    }
  },
  setInputValue(value) {
    if (this.inputValue === value) {
      return;
    }
    this.setState({
      inputValue: value,
    }, sct.FunctionSetInputValue);
  },
};
