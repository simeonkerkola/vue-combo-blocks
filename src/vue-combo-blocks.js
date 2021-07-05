import Vue, { defineComponent } from 'vue';

import {
  hasOwnProperty,
  isControlledProp,
} from './utils';

import props from './common/props';
import data from './common/data';
import computed from './common/computed';
import methods from './common/methods';
import slot from './common/slot';
import beforeCreate from './common/beforeCreate';
import * as sct from './stateChangeTypes';

const isVue3 = !!defineComponent;
console.log({ isVue3 });

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
    ...props,
  },
  watch: {
    value(newValue) {
      if (isControlledProp(this.$props, 'value')) {
        // Quietly set the internal state
        this.inputValue = this.itemToString(newValue);
        this.selectedItem = newValue;
      }
    },
  },
  beforeCreate,
  data() {
    return {
      selectedItem: this.value,
      inputValue: this.itemToString(this.value),
      ...data,
    };
  },
  computed: {
    menuElement() { return this.$el.querySelector(`#${this.computedMenuId}`); },
    ...computed,
  },
  methods: {
    setState(changes, type) {
      const oldState = this.$data;
      const newState = this.stateReducer(oldState, { changes, type });

      const isItemSelected = hasOwnProperty(newState, 'selectedItem');
      const hasSelectedItemChanged = newState.selectedItem !== oldState.selectedItem;

      // Emit select and change events
      if (isItemSelected) {
        this.$emit('select', newState.selectedItem, type);
        // Only emit 'change' if selectedItem has changed
        if (hasSelectedItemChanged) {
          this.$emit('change', newState.selectedItem, type);
        }
      }

      const nextFullState = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const prop in newState) {
        if (hasOwnProperty(newState, prop)) {
          if (oldState[prop] !== newState[prop]) {
            nextFullState[prop] = newState[prop];
            this[prop] = nextFullState[prop];
            // Emit other events
            if (prop === 'inputValue') this.$emit('input-value-change', newState[prop], type);
            else if (prop === 'isOpen') this.$emit('is-open-change', newState[prop], type);
            else if (prop === 'hoveredIndex') this.$emit('hovered-index-change', newState[prop], type);
          }
        }
      }
      this.$emit('state-change', nextFullState, type);
    },
    ...methods,

  },
  render() {
    return this.$scopedSlots.default(slot(this));
  },
});

VueComboBlocks.stateChangeTypes = sct;
export default VueComboBlocks;
