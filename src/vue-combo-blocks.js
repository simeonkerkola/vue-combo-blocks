import Vue from 'vue';
import {
  controls,
  hasKeyCode,
  getItemIndex,
  requiredProp,
  hasOwnProperty,
  getNextNonDisabledIndex,
  // scrollToElement,
} from './misc';
import * as sct from './stateChangeTypes';

let idCounter = 0;
const VueComboBlocks = Vue.component('vue-combo-blocks', {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    value: {
      default: null,
    },
    itemToString: {
      type: Function,
      default: (item) => (item ? String(item) : ''),
    },
    stateReducer: {
      type: Function,
      default: (s, a) => a.changes,
    },
    getItemId: {
      type: Function,
      default(i) {
        return `v-${this.idCounter}-vue-combo-blocks-item-${i}`;
      },
    },
    menuId: {
      type: String,
      default: '',
    },
    inputId: {
      type: String,
      default: '',
    },
    labelId: {
      type: String,
      default: '',
    },
  },
  beforeCreate() {
    this.idCounter = idCounter.toString();
    idCounter += 1;
  },
  mounted() {
    // console.log(this.getItemId(2));
    // console.log(this.some);
    // console.log(this.idCounter);
  },
  data() {
    return {
      selectedItem: this.value,
      hovered: null,
      isOpen: false,
      inputValue: this.itemToString(this.value),
      hoveredIndex: -1,

    };
  },
  computed: {
    computedMenuId() { return this.menuId || `v-${this.idCounter}-vue-combo-blocks-menu`; },
    computedInputId() { return this.inputId || `v-${this.idCounter}-vue-combo-blocks-input`; },
    computedLabelId() { return this.labelId || `v-${this.idCounter}-vue-combo-blocks-label`; },
    selectedIndex() { return this.items.indexOf(this.selectedItem); },
    // menuElement() { return this.$el.querySelector(`#${this.computedMenuId}`); },
  },
  methods: {
    setState(changes, type) {
      const oldState = this.$data;
      const newState = this.stateReducer(oldState, { changes, type });

      // selectedItem
      if (hasOwnProperty(newState, 'selectedItem')) {
        // Always emit the selectedItem, no matter has it changed
        this.selectedItem = newState.selectedItem;
        this.$emit('change', newState.selectedItem, type);
      }
      // inputValue
      if (hasOwnProperty(newState, 'inputValue')) {
        if (newState.inputValue !== oldState.inputValue) {
          this.inputValue = newState.inputValue;
          this.$emit('input-value-change', newState.inputValue, type);
        }
      }
      // isOpen
      if (hasOwnProperty(newState, 'isOpen')) {
        if (newState.isOpen !== oldState.isOpen) {
          this.isOpen = newState.isOpen;
          this.$emit('is-open-change', newState.isOpen, type);
        }
      }
      // hoveredIndex
      if (hasOwnProperty(newState, 'hoveredIndex')) {
        if (newState.hoveredIndex !== oldState.hoveredIndex) {
          this.hoveredIndex = newState.hoveredIndex;
          this.$emit('hovered-index-change', newState.hoveredIndex, type);
        }
      }
      // hovered
      if (hasOwnProperty(newState, 'hovered')) {
        if (newState.hovered !== oldState.hovered) {
          this.hovered = newState.hovered;
        }
      }
      // All changes
      this.$emit('state-change', newState, type);
    },
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
      // const vm = this;
      return {
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
        mouseleave() {
          vm.setState({
            hoveredIndex: -1,
            hovered: null,
          }, sct.ItemMouseLeave);
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
      disabled = false,
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
      return document.getElementById(this.getItemId(index));
    },
    // scrollItemIntoView(index) {
    //   setTimeout(() => {
    //     const itemElement = this.$el.querySelector(`#${this.getItemId(index)}`);
    //     // itemElement.scrollIntoView();
    //     scrollToElement(itemElement, this.menuElement, index);
    //   // console.log(itemElement, this.menuElement, this.hoveredIndex);
    //   }, 0);
    // },

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
          true,
        );
        const item = this.items[nextIndex];
        // this.$nextTick(() => {
        //   this.scrollItemIntoView(index);
        // });
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

  },
  render() {
    return this.$scopedSlots.default({
      // prop getters
      getInputProps: this.getInputProps,
      getItemProps: this.getItemProps,
      getMenuProps: this.getMenuProps,
      getComboboxProps: this.getComboboxProps,
      getLabelProps: this.getLabelProps,

      // event listeners
      getInputEventListeners: this.getInputEventListeners,
      getMenuEventListeners: this.getMenuEventListeners,
      getItemEventListeners: this.getItemEventListeners,

      // state
      isOpen: this.isOpen,
      selectedItem: this.selectedItem,
      hoveredIndex: this.hoveredIndex,
      inputValue: this.inputValue,

      // actions
      reset: this.reset,
      select: this.select,
      setInputValue: this.setInputValue,
      openMenu: this.openMenu,
      closeMenu: this.closeMenu,
    });
  },
});

VueComboBlocks.stateChangeTypes = sct;
export default VueComboBlocks;
