import * as sct from '../stateChangeTypes';
import {
  controls,
  hasKeyCode,
  getItemIndex,
  requiredProp,
  getNextNonDisabledIndex,
  scrollToElement,
} from '../utils';

export default {
  getComboboxProps() {
    return {
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-owns': this.computedMenuId,
      'aria-expanded': this.isOpen ? 'true' : 'false',
    };
  },
  getInputProps() {
    return {
      value: this.inputValue || '',
      'aria-activedescendant': this.hovered ? this.getItemId(this.hoveredIndex) : '',
      'aria-autocomplete': 'list',
      'aria-controls': this.computedMenuId,
      'aria-labelledby': this.computedLabelId,
      id: this.computedInputId,
      autocomplete: 'off',
    };
  },
  getMenuProps() {
    return {
      id: this.computedMenuId,
      role: 'listbox',
      'aria-labelledby': this.computedLabelId,
    };
  },
  getLabelProps() {
    return {
      id: this.computedLabelId,
      for: this.computedInputId,
    };
  },
  getInputEventListeners() {
    const vm = this;
    return {
      blur: vm.onInputBlur,
      input: vm.onInput,
      keydown: vm.onInputKeyDown,
      keyup: vm.onInputKeyUp,
    };
  },
  getMenuEventListeners() {
    const vm = this;
    return {
      mouseleave() {
        vm.setState({
          hoveredIndex: -1,
          hovered: null,
        }, sct.MenuMouseLeave);
      },
      mousedown(e) {
        // TODO: Prevent menu to close when clicking something
        // on a menu but not necessarily menu item.
        // This does the trick, but now you can't select and copy any text
        // in the menu.
        e.preventDefault();
      },
    };
  },
  getItemEventListeners({
    index,
    disabled,
    item = process.env.NODE_ENV === 'production' ? undefined
      : requiredProp('getItemEventListeners', 'item'),
  } = {}) {
    const itemIndex = getItemIndex(index, item, this.items);
    const vm = this;
    if (disabled) return {};
    return {
      mousemove() {
        if (vm.hoveredIndex === itemIndex) return;
        vm.setState({
          hoveredIndex: itemIndex,
          hovered: item,
        }, sct.ItemMouseMove);
      },
      mousedown(e) {
        e.preventDefault();
      },
      click() {
        // e.preventDefault();
        vm.setState({
          inputValue: vm.itemToString(item),
          selectedItem: item,
          isOpen: false,
          hoveredIndex: -1,
          hovered: null,
        }, sct.ItemClick);
      },
    };
  },
  getItemProps({
    index,
    disabled,
    item = process.env.NODE_ENV === 'production' ? undefined
      : requiredProp('getItemProps', 'item'),
  } = {}) {
    const itemIndex = getItemIndex(index, item, this.items);
    const id = this.getItemId(itemIndex);
    return {
      id,
      disabled,
      role: 'option',
      'aria-selected': this.isHovered(itemIndex) || this.isSelected(itemIndex) ? 'true' : 'false',
    };
  },
  isSelected(index) {
    return index === this.selectedIndex;
  },
  isHovered(index) {
    return index === this.hoveredIndex;
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
  onInputKeyDown(e) {
    // prevent form submit on keydown if Enter key registered in the keyup
    if (e.key === 'Enter' && this.isOpen) {
      e.preventDefault();
    // } else if (e.key === 'Tab' && this.hovered) {
    //   this.setState({
    //     inputValue: this.itemToString(this.hovered),
    //     selectedItem: this.hovered,
    //     isOpen: false,
    //   }, sct.InputKeyDownTab);
    } else if (hasKeyCode(controls.arrowDownKey, e) && !this.isOpen) {
      this.setState({ isOpen: true }, sct.InputKeyDownArrowDown);
      this.moveSelection(e);
    } else this.moveSelection(e);
  },
  onInputKeyUp(e) {
    const { enterKey, escKey } = controls;
    if (this.isOpen) {
      if (hasKeyCode(enterKey, e)) {
        if (this.hoveredIndex >= 0) {
          e.preventDefault();
          const itemNode = this.getItemNodeFromIndex(this.hoveredIndex);
          if (itemNode && itemNode.hasAttribute('disabled')) {
            return;
          }
          this.setState({
            inputValue: this.itemToString(this.hovered),
            selectedItem: this.hovered,
            hoveredIndex: -1,
            hovered: null,
            isOpen: false,
          }, sct.InputKeyUpEnter);
        }
      } else if (hasKeyCode(escKey, e)) {
        this.setState({
          hoveredIndex: -1,
          hovered: null,
          isOpen: false,
        }, sct.InputKeyUpEscape);
      }
    }
  },
  onInputBlur() {
    this.setState({
      isOpen: false,
      inputValue: this.itemToString(this.selectedItem),
      hovered: null,
      hoveredIndex: -1,
    }, sct.InputBlur);
  },
  onInput(e) {
    // Custom input component might return just the value
    const inputValue = e.target ? e.target.value : e;
    this.setState({
      inputValue,
      hovered: null,
      isOpen: true,
    },
    sct.InputChange);
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
