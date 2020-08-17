import Vue from 'vue';
import {
  controls, hasKeyCode, getItemIndex, requiredProp,
} from './misc';

/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
export default Vue.component('combo-blocks', {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    value: {},
    itemToString: {
      type: Function,
      default: (item) => (item ? String(item) : ''),
    },
    selectedItemChanged: {
      type: Function,
      default: (prevItem, item) => (prevItem !== item),
    },
  },
  data() {
    return {
      selected: this.value,
      hovered: null,
      isOpen: false,
      inputValue: this.itemToString(this.value),
      isPlainSuggestion: false,
      controlScheme: {},
      listId: `${this._uid}-combo-blocks-list`,
      inputId: `${this._uid}-combo-blocks-input`,
      labelId: `${this._uid}-combo-blocks-label`,
      hoveredIndex: -1,
      selectedIndex: this.items.indexOf(this.value),
    };
  },
  watch: {
    value: {
      handler(current) {
        const textValue = this.itemToString(current);
        this.upDateInputValue(textValue);
      },
      immediate: true,
    },
  },
  methods: {
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
        touchleave: (e) => {
          console.log('touch out');
          vm.onBlur(e);
        },
        blur: vm.onBlur,
        focus: vm.onFocus,
        input: vm.onInput,
        keydown: vm.onKeyDown,
        keyup: vm.onListKeyUp,
      };
    },
    getListEventListeners() {
      const vm = this;
      return {
        mousemove(e) {
          vm.hoverList(true);
          vm.$emit('mousemove', e);
        },
        mouseleave(e) {
          vm.hoverList(false);
          vm.$emit('mouseleave', e);
        },
      };
    },
    getItemEventListeners({ item, index }) {
      const itemIndex = getItemIndex(index, item, this.items);
      const vm = this;
      return {
        mousemove(e) {
          vm.setHoveredItem(item, itemIndex, e.target);
          vm.$emit('mousemove', e);
        },
        mouseleave(e) {
          vm.setHoveredItem(undefined);
          vm.$emit('mouseleave', e);
        },
        mousedown(e) {
          e.preventDefault();
        },
        click(e) {
          vm.itemClick(item, itemIndex, e);
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
    setInputValue(text) {
      this.$nextTick(() => {
        this.inputValue = text;
        this.$emit('input-value-change', text);
      });
    },
    clearSelection() {
      this.selected = null;
      this.selectedIndex = -1;
      this.setInputValue('');
      this.$emit('change', null);
    },
    select(item, index) {
      if (this.selectedItemChanged(this.selected, item)) {
        this.selected = item;
        this.selectedIndex = index;
        this.$emit('change', item);
      }
      this.autocompleteText(item);
    },
    setHoveredItem(item, index, elem) {
      if (item && item !== this.hovered) {
        this.$emit('hover', item, elem);
      }
      this.hovered = item;
      this.hoveredIndex = typeof index === 'number' ? index : -1;
    },
    hoverList() {
      // this.isOverList = isOverList;
    },
    hideList() {
      if (this.isOpen) {
        this.isOpen = false;
        this.setHoveredItem(null);
        this.$emit('hide-list');
      }
    },
    showList() {
      if (!this.isOpen) {
        this.isOpen = true;
        this.$emit('show-list');
      }
    },
    onShowList(e) {
      if (hasKeyCode(controls.arrowDownKey, e)) {
        this.showList();
      }
    },
    moveSelection(e) {
      if (!this.isOpen || !this.items.length) return;
      if (
        hasKeyCode(controls.arrowDownKey, e)
        || hasKeyCode(controls.arrowUpKey, e)
      ) {
        e.preventDefault();
        const isMovingDown = hasKeyCode(controls.arrowDownKey, e);
        const direction = isMovingDown * 2 - 1;
        const listEdge = isMovingDown ? 0 : this.items.length - 1;
        const hoversBetweenEdges = isMovingDown
          ? this.hoveredIndex < this.items.length - 1
          : this.hoveredIndex > 0;
        const index = hoversBetweenEdges ? this.hoveredIndex + direction : listEdge;
        const item = this.items[index];
        this.setHoveredItem(item, index);
      }
    },
    onKeyDown(e) {
      // prevent form submit on keydown if Enter key registered in the keyup list
      if (e.key === 'Enter' && this.isOpen) {
        e.preventDefault();
      }
      if (e.key === 'Tab' && this.hovered) {
        this.select(this.hovered, this.hoveredIndex);
      }
      this.onShowList(e);
      this.moveSelection(e);
    },
    onListKeyUp(e) {
      const { enterKey, escKey } = controls;
      if (this.isOpen) {
        if (hasKeyCode(enterKey, e)) {
          e.preventDefault();
          this.select(this.hovered, this.hoveredIndex);
          this.hideList();
        } else if (hasKeyCode(escKey, e)) {
          this.hideList();
        }
      }
    },
    itemClick(item, index, e) {
      e.preventDefault();
      this.select(item, index);
      this.hideList();
    },
    onBlur(e) {
      this.hideList();
      this.$emit('blur', e);
      if (this.selected) {
        this.setInputValue(this.itemToString(this.selected));
      } else this.setInputValue('');
    },
    onFocus(e) {
      // Only emit, if it was a native input focus
      if (e) {
        this.$emit('focus', e);
      }
    },
    onInput(inputEvent) {
      const value = !inputEvent.target ? inputEvent : inputEvent.target.value;

      this.upDateInputValue(value);
      this.showList();
      this.$emit('input-value-change', value);
    },
    upDateInputValue(value) {
      if (this.inputValue === value) {
        return;
      }
      this.inputValue = value;
      if (this.hovered) this.setHoveredItem(null);
    },
    getItemId(i) {
      return `${this._uid}-combo-blocks-item-${i}`;
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
      clearSelection: this.clearSelection,
    });
  },
});
