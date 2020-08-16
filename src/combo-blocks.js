import Vue from 'vue';
import {
  defaultControls, hasKeyCodeByCode, hasKeyCode, getItemIndex, requiredProp,
} from './misc';
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
export default Vue.component('combo-blocks', {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    controls: {
      type: Object,
      default: () => defaultControls,
    },
    // displayAttribute: {
    //   type: String,
    //   default: 'title',
    // },
    // valueAttribute: {
    //   type: String,
    //   default: 'id',
    // },
    items: {
      type: Array,
      required: true,
    },
    nullableSelect: {
      type: Boolean,
      default: false,
    },
    value: {},
    itemToString: {
      type: Function,
      default: (item) => (item ? String(item) : ''),
    },
    // mode: {
    //   type: String,
    //   default: 'input',
    // },
  },
  data() {
    return {
      selected: this.value,
      hovered: null,
      // items: [],
      isOpen: false,
      inputValue: this.itemToString(this.value),
      isPlainSuggestion: false,
      // isClicking: false,
      // isOverList: false,
      // isInFocus: false,
      controlScheme: {},
      listId: `${this._uid}-combo-blocks-list`,
      inputId: `${this._uid}-combo-blocks-input`,
      labelId: `${this._uid}-combo-blocks-label`,
      hoveredIndex: -1,
      selectedIndex: this.items.indexOf(this.value),
    };
  },
  computed: {
    // isSelectedUpToDate() {
    //   return !!this.selected && this.itemToString(this.selected) === this.inputValue;
    // },
  },
  // Handle run-time mode changes (now working):
  watch: {
    // mode: {
    //   handler(current) {
    //     this.constructor.options.model.event = current;
    //     // Can be null if the component is root
    //     if (this.$parent) this.$parent.$forceUpdate();
    //     this.$nextTick(() => {
    //       if (current === 'input') {
    //         this.$emit('input-value-change', this.inputValue);
    //       } else {
    //         this.$emit('change', this.selected);
    //       }
    //     });
    //   },
    //   immediate: true,
    // },
    // list: {
    //   handler(current) {
    //     this.items = this.getSuggestions()
    //   },
    //   immediate: true
    // },
    value: {
      handler(current) {
        const textValue = this.itemToString(current);
        this.updateTextOutside(textValue);
      },
      immediate: true,
    },
  },
  created() {
    this.controlScheme = { ...defaultControls, ...this.controls };
  },
  mounted() {
    // this.inputElement = this.$refs.inputSlot.querySelector('input')
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
        mouseenter(e) {
          vm.hoverList(true);
          vm.$emit('mouseenter', e);
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
        // TODO: use onMouseMove
        mouseenter(e) {
          vm.setHoveredItem(item, itemIndex, e.target);
          vm.$emit('mouseenter', e);
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
      // if (index === undefined) {
      //   this.items.push(item);
      //   // eslint-disable-next-line no-param-reassign
      //   index = this.items.indexOf(item);
      // } else {
      //   this.items[index] = item;
      // }

      const id = this.getItemId(itemIndex);
      return {
        id,
        role: 'option',
        'aria-selected': this.isHovered(itemIndex) || this.isSelected(itemIndex) ? 'true' : 'false',
      };
    },
    // onListMouseEnter(e) {
    //   this.hoverList(true);
    //   this.$emit('mouseenter', e);
    // },
    // onListMouseLeave(e) {
    //   this.hoverList(false);
    //   this.$emit('mouseleave', e);
    // },
    // isEqual(suggestion, item) {
    //   return item && this.valueProperty(suggestion) === this.valueProperty(item);
    // },
    isSelected(index) {
      return index === this.selectedIndex;
    },
    isHovered(index) {
      return index === this.hoveredIndex;
    },
    // getPropertyByAttribute(obj, attr) {
    //   // eslint-disable-next-line no-nested-ternary
    //   return this.isPlainSuggestion ?
    //    obj : typeof obj !== 'undefined' ? fromPath(obj, attr) : obj;
    // },
    // displayProperty(obj) {
    //   if (this.isPlainSuggestion) {
    //     return obj;
    //   }
    //   let display = this.getPropertyByAttribute(obj, this.displayAttribute);
    //   if (typeof display === 'undefined') {
    //     display = JSON.stringify(obj);
    //   }
    //   return String(display || '');
    // },
    // valueProperty(obj) {
    //   if (this.isPlainSuggestion) {
    //     return obj;
    //   }
    //   const value = this.getPropertyByAttribute(obj, this.valueAttribute);
    //   if (typeof value === 'undefined') {
    //     console.error(
    //       `[vue-simple-suggest]: Please, check if you passed 'value-attribute'
    //        (default is 'id') and 'display-attribute' (default is 'title') props correctly.
    //     Your list objects should always contain a unique identifier.`,
    //     );
    //   }
    //   return value;
    // },
    autocompleteText(suggestion) {
      this.setInputValue(this.itemToString(suggestion));
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
      // if (this.selected !== item || (this.nullableSelect && !item)) {
      if (this.selected !== item) {
        this.selected = item;
        this.selectedIndex = index;
        this.$emit('change', item);
      }
      this.autocompleteText(item);

      // this.setHoveredItem(null);
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
      if (hasKeyCode(this.controlScheme.showList, e)) {
        this.showList();
      }
    },
    moveSelection(e) {
      if (!this.isOpen || !this.items.length) return;
      if (hasKeyCode([this.controlScheme.selectionUp, this.controlScheme.selectionDown], e)) {
        e.preventDefault();
        const isMovingDown = hasKeyCode(this.controlScheme.selectionDown, e);
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
      const { select } = this.controlScheme;
      const { hideList } = this.controlScheme;
      // prevent form submit on keydown if Enter key registered in the keyup list
      if (e.key === 'Enter' && this.isOpen && hasKeyCodeByCode([select, hideList], 13)) {
        e.preventDefault();
      }
      if (e.key === 'Tab' && this.hovered) {
        this.select(this.hovered, this.hoveredIndex);
      }
      this.onShowList(e);
      this.moveSelection(e);
      this.onAutocomplete(e);
    },
    onListKeyUp(e) {
      const { select } = this.controlScheme;
      const { hideList } = this.controlScheme;
      if (this.isOpen && hasKeyCode([select, hideList], e)) {
        e.preventDefault();
        if (hasKeyCode(select, e)) {
          this.select(this.hovered, this.hoveredIndex);
        }
        this.hideList();
      }
    },
    onAutocomplete(e) {
      if (
        hasKeyCode(this.controlScheme.autocomplete, e)
        && (e.ctrlKey || e.shiftKey)
        && this.items.length > 0
        && this.items[0]
        && this.isOpen
      ) {
        e.preventDefault();
        this.setHoveredItem(this.items[0]);
        this.autocompleteText(this.items[0]);
      }
    },
    itemClick(item, index, e) {
      e.preventDefault();
      this.$emit('item-click', item, e);
      this.select(item, index);
      this.hideList();
      // / Ensure, that all needed flags are off before finishing the click.
      // this.isClicking = false;
      // this.isOverList = false;
    },
    onBlur(e) {
      // if (this.isInFocus) {
      // / Clicking starts here, because input's blur occurs before the itemClick
      // / and exactly when the user clicks the mouse button or taps the screen.
      // this.isClicking = this.isOverList;
      // if (!this.isClicking) {
      // this.isInFocus = false;
      this.hideList();
      this.$emit('blur', e);
      if (this.selected) {
        this.setInputValue(this.itemToString(this.selected));
      } else this.setInputValue('');
      // }
      // } else {
      //   // this.inputElement.blur()
      //   // console.error(
      //   //   `This should never happen!
      //   `
      //   // )
      // }
    },
    onFocus(e) {
      // this.isInFocus = true;
      // Only emit, if it was a native input focus
      if (e) {
        this.$emit('focus', e);
      }
    },
    onInput(inputEvent) {
      const value = !inputEvent.target ? inputEvent : inputEvent.target.value;

      this.updateTextOutside(value);
      this.showList();
      this.$emit('input-value-change', value);
    },
    updateTextOutside(value) {
      if (this.inputValue === value) {
        return;
      }
      this.inputValue = value;
      if (this.hovered) this.setHoveredItem(null);
    },
    getSuggestions() {
      return [...this.list];
    },
    clearSuggestions() {
      this.items = [];
    },
    getItemId(i) {
      return `${this._uid}-combo-blocks-item-${i}`;
    },
  },
  render() {
    // this.clearSuggestions();

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
