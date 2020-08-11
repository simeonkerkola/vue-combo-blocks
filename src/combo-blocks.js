import Vue from 'vue';
import {
  defaultControls, fromPath, hasKeyCodeByCode, hasKeyCode,
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
    displayAttribute: {
      type: String,
      default: 'title',
    },
    valueAttribute: {
      type: String,
      default: 'id',
    },
    // list: {
    //   type: [Function, Array],
    //   default: () => [],
    // },
    nullableSelect: {
      type: Boolean,
      default: false,
    },
    value: {},
    mode: {
      type: String,
      default: 'input',
    },
  },
  data() {
    return {
      selected: this.value,
      hovered: null,
      // suggestions: [],
      isOpen: false,
      inputValue: this.displayProperty(this.value),
      isPlainSuggestion: false,
      isClicking: false,
      isOverList: false,
      isInFocus: false,
      controlScheme: {},
      listId: `${this._uid}-combo-blocks-list`,
      inputId: `${this._uid}-combo-blocks-input`,
      labelId: `${this._uid}-combo-blocks-label`,
      hoveredIndex: -1,
    };
  },
  computed: {
    // isSelectedUpToDate() {
    //   return !!this.selected && this.displayProperty(this.selected) === this.inputValue;
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
    //         this.$emit('input', this.inputValue);
    //       } else {
    //         this.$emit('change', this.selected);
    //       }
    //     });
    //   },
    //   immediate: true,
    // },
    // list: {
    //   handler(current) {
    //     this.suggestions = this.getSuggestions()
    //   },
    //   immediate: true
    // },
    value: {
      handler(current) {
        if (typeof current !== 'string') {
          const textValue = this.displayProperty(current);
          this.updateTextOutside(textValue);
        } else {
          this.updateTextOutside(current);
        }
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
        'aria-activedescendant': this.hovered ? this.getId(this.hovered, this.hoveredIndex) : '',
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
        mouseenter: vm.onListMouseEnter,
        mouseleave: vm.onListMouseLeave,
      };
    },
    getItemEventListeners(item) {
      const vm = this;
      return {
        // TODO: use onMouseMove
        mouseenter(e) {
          vm.hover(item, e.target);
          vm.$emit('mouseenter', e);
        },
        mouseleave(e) {
          vm.hover(undefined);
          vm.$emit('mouseleave', e);
        },
        mousedown(e) {
          e.preventDefault();
        },
        click(e) {
          vm.suggestionClick(item, e);
          console.log('click');
        },
      };
    },
    getItemProps({ item, index } = {}) {
      if (index === undefined) {
        this.suggestions.push(item);
        // eslint-disable-next-line no-param-reassign
        index = this.suggestions.indexOf(item);
      } else {
        this.suggestions[index] = item;
      }
      const id = this.getId(item, index);
      return {
        key: id,
        id,
        role: 'option',
        'aria-selected': this.isHovered(item) || this.isSelected(item) ? 'true' : 'false',
      };
    },
    onItemMouseEnter() {

    },
    onListMouseEnter(e) {
      this.hoverList(true);
      this.$emit('mouseenter', e);
    },
    onListMouseLeave(e) {
      this.hoverList(false);
      this.$emit('mouseleave', e);
    },
    isEqual(suggestion, item) {
      return item && this.valueProperty(suggestion) === this.valueProperty(item);
    },
    isSelected(suggestion) {
      return this.isEqual(suggestion, this.selected);
    },
    isHovered(suggestion) {
      return this.isEqual(suggestion, this.hovered);
    },
    getPropertyByAttribute(obj, attr) {
      // eslint-disable-next-line no-nested-ternary
      return this.isPlainSuggestion ? obj : typeof obj !== 'undefined' ? fromPath(obj, attr) : obj;
    },
    displayProperty(obj) {
      if (this.isPlainSuggestion) {
        return obj;
      }
      let display = this.getPropertyByAttribute(obj, this.displayAttribute);
      if (typeof display === 'undefined') {
        display = JSON.stringify(obj);
      }
      return String(display || '');
    },
    valueProperty(obj) {
      if (this.isPlainSuggestion) {
        return obj;
      }
      const value = this.getPropertyByAttribute(obj, this.valueAttribute);
      if (typeof value === 'undefined') {
        console.error(
          `[vue-simple-suggest]: Please, check if you passed 'value-attribute' (default is 'id') and 'display-attribute' (default is 'title') props correctly.
        Your list objects should always contain a unique identifier.`,
        );
      }
      return value;
    },
    autocompleteText(suggestion) {
      this.setText(this.displayProperty(suggestion));
    },
    setText(text) {
      this.$nextTick(() => {
        this.inputValue = text;
        this.$emit('input', text);
      });
    },
    clearSelection() {
      this.selected = null;
      this.setText('');
      this.$emit('change', null);
    },
    select(item) {
      if (this.selected !== item || (this.nullableSelect && !item)) {
        this.selected = item;
        this.$emit('change', item);
        if (item) {
          this.autocompleteText(item);
        }
      }
      this.hover(null);
    },
    hover(item, elem) {
      if (item && item !== this.hovered) {
        this.$emit('hover', item, elem);
      }
      this.hovered = item;
      this.hoveredIndex = this.suggestions.findIndex(
        (el) => item && this.valueProperty(item) === this.valueProperty(el),
      );
    },
    hoverList(isOverList) {
      this.isOverList = isOverList;
    },
    hideList() {
      if (this.isOpen) {
        this.isOpen = false;
        this.hover(null);
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
      if (!this.isOpen || !this.suggestions.length) return;
      if (hasKeyCode([this.controlScheme.selectionUp, this.controlScheme.selectionDown], e)) {
        e.preventDefault();
        const isMovingDown = hasKeyCode(this.controlScheme.selectionDown, e);
        const direction = isMovingDown * 2 - 1;
        const listEdge = isMovingDown ? 0 : this.suggestions.length - 1;
        const hoversBetweenEdges = isMovingDown
          ? this.hoveredIndex < this.suggestions.length - 1
          : this.hoveredIndex > 0;
        let item = null;

        if (hoversBetweenEdges) {
          item = this.suggestions[this.hoveredIndex + direction];
        } else {
          item = this.suggestions[listEdge];
        }

        this.hover(item);
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
        this.select(this.hovered);
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
          this.select(this.hovered);
        }
        this.hideList();
      }
    },
    onAutocomplete(e) {
      if (
        hasKeyCode(this.controlScheme.autocomplete, e)
        && (e.ctrlKey || e.shiftKey)
        && this.suggestions.length > 0
        && this.suggestions[0]
        && this.isOpen
      ) {
        e.preventDefault();
        this.hover(this.suggestions[0]);
        this.autocompleteText(this.suggestions[0]);
      }
    },
    suggestionClick(suggestion, e) {
      e.preventDefault();
      this.$emit('suggestion-click', suggestion, e);
      this.select(suggestion);
      this.hideList();
      // / Ensure, that all needed flags are off before finishing the click.
      this.isClicking = false;
      this.isOverList = false;
    },
    onBlur(e) {
      if (this.isInFocus) {
        // / Clicking starts here, because input's blur occurs before the suggestionClick
        // / and exactly when the user clicks the mouse button or taps the screen.
        this.isClicking = this.isOverList;
        if (!this.isClicking) {
          this.isInFocus = false;
          this.hideList();
          this.$emit('blur', e);
          if (this.selected) {
            this.setText(this.displayProperty(this.selected));
          } else this.setText('');
        }
      } else {
        // this.inputElement.blur()
        // console.error(
        //   `This should never happen!
        //   If you encountered this error, please make sure that your input component
        //   emits 'focus' events properly.
        //   For more info see https://github.com/KazanExpress/vue-simple-suggest#custom-input.
        //   If your 'vue-simple-suggest' setup does not include a custom input component - please,
        //   report to https://github.com/KazanExpress/vue-simple-suggest/issues/new`
        // )
      }
    },
    onFocus(e) {
      this.isInFocus = true;
      // Only emit, if it was a native input focus
      if (e) {
        this.$emit('focus', e);
      }
    },
    onInput(inputEvent) {
      const value = !inputEvent.target ? inputEvent : inputEvent.target.value;
      this.updateTextOutside(value);
      this.showList();
      this.$emit('input', value);
    },
    updateTextOutside(value) {
      if (this.inputValue === value) {
        return;
      }
      this.inputValue = value;
      if (this.hovered) this.hover(null);
    },
    getSuggestions() {
      return [...this.list];
    },
    clearSuggestions() {
      this.suggestions = [];
    },
    getId(value, i) {
      return `${this._uid}-suggestion-${i}`;
    },
  },
  render() {
    this.clearSuggestions();

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
    });
  },
});
