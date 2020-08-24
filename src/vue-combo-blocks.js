/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
import Vue from 'vue';
import {
  controls, hasKeyCode, getItemIndex, requiredProp,
} from './misc';
import * as sct from './stateChangeTypes';

export const stateChangeTypes = sct;
export default Vue.component('vue-combo-blocks', {
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
  },
  data() {
    return {
      selected: this.value,
      hovered: null,
      isOpen: false,
      isOverList: false,
      inputValue: this.itemToString(this.value),
      hoveredIndex: -1,
      selectedIndex: this.items.indexOf(this.value),
    };
  },
  computed: {
    listId() { return `${this._uid}-vue-combo-blocks-list`; },
    inputId() { return `${this._uid}-vue-combo-blocks-input`; },
    labelId() { return `${this._uid}-vue-combo-blocks-label`; },
  },
  methods: {
    emitStateChanges(key, changes) {
      switch (key) {
        case 'selected':
          this.$emit('change', changes[key]);
          break;
        case 'inputValue':
          this.$emit('input-value-change', changes[key]);
          break;
        default:
          break;
      }
    },
    setState(changes, type) {
      const oldState = this.$data;
      const newState = this.stateReducer(oldState, { changes, type });

      Object.keys(newState).forEach((key) => {
        if (oldState[key] !== newState[key]) {
          this[key] = newState[key];
          this.emitStateChanges(key, newState);
        }
      });
      this.$emit('stateChange', newState);
    },
    getComboboxProps() {
      return {
        role: 'combobox',
        'aria-haspopup': 'listbox',
        'aria-owns': this.listId,
        'aria-expanded': this.isOpen ? 'true' : 'false',
      };
    },
    getInputProps() {
      return {
        value: this.inputValue || '',
        'aria-activedescendant': this.hovered ? this.getItemId(this.hoveredIndex) : '',
        'aria-autocomplete': 'list',
        'aria-controls': this.listId,
        id: this.inputId,
        autocomplete: 'off',
      };
    },
    getListProps() {
      return {
        id: this.listId,
        role: 'listbox',
        'aria-labelledby': this.labelId,
      };
    },
    getLabelProps() {
      return {
        id: this.labelId,
        for: this.inputId,
      };
    },
    getInputEventListeners() {
      const vm = this;
      return {
        blur: vm.onInputBlur,
        input: vm.onInput,
        keydown: vm.onKeyDown,
        keyup: vm.onListKeyUp,
      };
    },
    getListEventListeners() {
      const vm = this;
      return {
        mouseleave() {
          vm.setState({
            hoveredIndex: -1,
            hovered: null,
          }, sct.MenuMouseLeave);
        },
        // TODO: Prevent list to close when clicking something
        // on a list but not necessarily list item.
        // This does the trick, but now you can't select and copy any text
        // in the list.
        mousedown(e) {
          e.preventDefault();
        },
      };
    },
    getItemEventListeners({
      index,
      item = process.env.NODE_ENV === 'production' ? undefined
        : requiredProp('getItemEventListeners', 'item'),
    } = {}) {
      const itemIndex = getItemIndex(index, item, this.items);
      const vm = this;
      return {
        mousemove() {
          vm.setState({
            hoveredIndex: itemIndex,
            hovered: item,
          }, sct.ItemMouseMove);
        },
        mousedown(e) {
          e.preventDefault();
        },
        click(e) {
          e.preventDefault();
          vm.setState({
            inputValue: vm.itemToString(item),
            selected: item,
            selectedIndex: itemIndex,
            isOpen: false,
            hoveredIndex: -1,
            hovered: null,
          }, sct.ItemClick);
        },
      };
    },
    getItemProps({
      index,
      item = process.env.NODE_ENV === 'production' ? undefined
        : requiredProp('getItemProps', 'item'),
    } = {}) {
      const itemIndex = getItemIndex(index, item, this.items);
      const id = this.getItemId(itemIndex);
      return {
        id,
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
        selected: null,
        selectedIndex: -1,
        inputValue: '',
      }, sct.FunctionReset);
    },
    select(item, index) {
      const itemIndex = getItemIndex(index, item, this.items);
      this.setState({
        selected: item,
        selectedIndex: itemIndex,
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
    hoverList(isOverList) {
      this.isOverList = isOverList;
    },
    closeList() {
      this.setState({
        isOpen: false,
        hoveredIndex: -1,
        hovered: null,
      }, sct.FunctionCloseList);
    },
    openList() {
      this.setState({
        isOpen: true,
      }, sct.FunctionOpenList);
    },
    moveSelection(e) {
      if (!this.isOpen || !this.items.length) return;
      const isMovingDown = hasKeyCode(controls.arrowDownKey, e);
      const isMovingUp = hasKeyCode(controls.arrowUpKey, e);

      if (isMovingDown || isMovingUp) {
        e.preventDefault();
        const direction = isMovingDown * 2 - 1;
        const listEdge = isMovingDown ? 0 : this.items.length - 1;
        const hoversBetweenEdges = isMovingDown
          ? this.hoveredIndex < this.items.length - 1
          : this.hoveredIndex > 0;
        const index = hoversBetweenEdges ? this.hoveredIndex + direction : listEdge;
        const item = this.items[index];
        this.setState({
          hoveredIndex: index,
          hovered: item,
        }, isMovingDown ? sct.InputKeyDownArrowDown : sct.InputKeyDownArrowUp);
      }
    },
    onKeyDown(e) {
      // prevent form submit on keydown if Enter key registered in the keyup list
      if (e.key === 'Enter' && this.isOpen) {
        e.preventDefault();
      } else if (e.key === 'Tab' && this.hovered) {
        this.setState({
          inputValue: this.itemToString(this.hovered),
          selected: this.hovered,
          selectedIndex: this.hoveredIndex,
          isOpen: false,
        }, sct.InputKeyDownTab);
      } else if (hasKeyCode(controls.arrowDownKey, e) && !this.isOpen) {
        this.setState({ isOpen: true }, sct.InputKeyDownArrowDown);
        this.moveSelection(e);
      } else this.moveSelection(e);
    },
    onListKeyUp(e) {
      const { enterKey, escKey } = controls;
      if (this.isOpen) {
        if (hasKeyCode(enterKey, e)) {
          e.preventDefault();
          this.setState({
            inputValue: this.itemToString(this.hovered),
            selected: this.hovered,
            selectedIndex: this.hoveredIndex,
            isOpen: false,
          }, sct.InputKeyUpEnter);
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
        inputValue: this.itemToString(this.selected),
        hovered: null,
        hoveredIndex: -1,
      }, sct.InputBlur);
    },
    onInput(e) {
      this.setState({
        inputValue: e.target.value,
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
    getItemId(i) {
      return `${this._uid}-vue-combo-blocks-item-${i}`;
    },
  },
  render() {
    return this.$scopedSlots.default({
      // prop getters
      getInputProps: this.getInputProps,
      getItemProps: this.getItemProps,
      getListProps: this.getListProps,
      getComboboxProps: this.getComboboxProps,

      // event listeners
      getInputEventListeners: this.getInputEventListeners,
      getListEventListeners: this.getListEventListeners,
      getItemEventListeners: this.getItemEventListeners,

      // state
      isOpen: this.isOpen,
      selected: this.selected,
      hoveredIndex: this.hoveredIndex,
      inputValue: this.inputValue,

      // actions
      reset: this.reset,
      setInputValue: this.setInputValue,
      openList: this.openList,
      closeList: this.closeList,
    });
  },
});
