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
    // isSelectedItemChanged: {
    //   type: Function,
    //   default: (prevItem, item) => (prevItem !== item),
    // },
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
      listId: `${this._uid}-vue-combo-blocks-list`,
      inputId: `${this._uid}-vue-combo-blocks-input`,
      labelId: `${this._uid}-vue-combo-blocks-label`,
      hoveredIndex: -1,
      selectedIndex: this.items.indexOf(this.value),
    };
  },
  // watch: {
  //   // inputValue: {
  //   //   handler(current, old) {
  //   //     if (current !== old) this.$emit('input-value-change', current);
  //   //   },
  //   // immediate: true,
  //   // },
  //   // value: {
  //   //   handler(current) {
  //   //     const textValue = this.itemToString(current);
  //   //     this.upDateInputValue(textValue);
  //   //   },
  //   //   immediate: true,
  //   // },
  //   // selected: {
  //   //   handler(current, old) {
  //   //     console.log({ current, old }, this.isSelectedItemChanged(old, current));
  //   //     if (this.isSelectedItemChanged(old, current)) this.$emit('change', current);
  //   //   },

  //   // },
  // },
  mounted() {
    // this.setState({ isOpen: true });
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
      // console.log({ oldState });
      const newState = this.stateReducer(oldState, { changes, type });
      // console.log({ newState });
      // eslint-disable-next-line array-callback-return
      Object.keys(newState).map((key) => {
        // console.log(this[key], changes[key]);
        // console.log(key);
        if (oldState[key] !== newState[key]) {
          this[key] = newState[key];
          this.emitStateChanges(key, newState);
        }
        // console.log(this[key], newState[key]);
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
        // touchleave: (e) => {
        //   vm.onInputBlur(e);
        // },
        blur: vm.onInputBlur,
        input: vm.onInput,
        keydown: vm.onKeyDown,
        keyup: vm.onListKeyUp,
      };
    },
    getListEventListeners() {
      const vm = this;
      return {
        mousemove() {
          // vm.hoverList(true);
          // vm.$emit('mousemove', e);
        },
        mouseleave() {
          vm.setState({
            hoveredIndex: -1,
            hovered: null,
          }, sct.MenuMouseLeave);
          // vm.hoverList(false);
          // vm.$emit('mouseleave', e);
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
          // vm.setHoveredItem(item, itemIndex, e.target);
          // vm.$emit('mousemove', e);
        },
        mouseleave() {
          // vm.setHoveredItem(undefined);
          // vm.$emit('mouseleave', e);
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
          // vm.itemClick(item, itemIndex, e);
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
    // setInputValue(text) {
    //   // this.$nextTick(() => {
    //   this.inputValue = text;
    //   // });
    // },
    clearSelection() {
      this.setState({
        selected: null,
        selectedIndex: -1,
        inputValue: '',
      }, sct.FunctionReset);
      // this.selected = null;
      // this.selectedIndex = -1;
      // this.setInputValue('');
      // this.$emit('change', null);
    },
    select(item, index) {
      // if (this.isSelectedItemChanged(this.selected, item)) {
      const itemIndex = getItemIndex(index, item, this.items);
      this.setState({
        selected: item,
        selectedIndex: itemIndex,
        isOpen: false,
        hoveredIndex: -1,
        hovered: null,
      }, sct.FunctionSelectItem);
      // this.selected = item;
      // this.selectedIndex = index;
      // this.closeList();
      // this.$emit('change', item);
      // }
      // this.autocompleteText(item);
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
    // onShowList(e) {
    //   if (hasKeyCode(controls.arrowDownKey, e)) {
    //     this.showList();
    //   }
    // },
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
        // this.setHoveredItem(item, index);
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
        // this.select(this.hovered, this.hoveredIndex);
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
      // this.onShowList(e);
    },
    onListKeyUp(e) {
      const { enterKey, escKey } = controls;
      if (this.isOpen) {
        if (hasKeyCode(enterKey, e)) {
          e.preventDefault();
          // this.select(this.hovered, this.hoveredIndex);
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
          // this.closeList();
        }
      }
    },
    // itemClick(item, index, e) {
    //   e.preventDefault();
    //   this.select(item, index);
    // },
    onInputBlur() {
      // // if (!this.isOverList) {
      // this.closeList();
      // this.$emit('blur', e);
      // if (this.selected) {
      //   this.setInputValue(this.itemToString(this.selected));
      // } else this.setInputValue('');
      // // }
      this.setState({
        isOpen: false,
        inputValue: this.itemToString(this.selected),
        hovered: null,
        hoveredIndex: -1,
      }, sct.InputBlur);
    },
    onInput(e) {
      // const value = !inputEvent.target ? inputEvent : inputEvent.target.value;
      this.setState({
        inputValue: e.target.value,
        hovered: null,
        isOpen: true,
      },
      sct.InputChange);

      // this.upDateInputValue(value);
      // this.showList();
    },
    // upDateInputValue(value) {
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
      clearSelection: this.clearSelection,
      setInputValue: this.setInputValue,
      openList: this.openList,
      closeList: this.closeList,
    });
  },
});
