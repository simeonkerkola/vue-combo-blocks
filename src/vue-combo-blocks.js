import { defineComponent } from 'vue';
import {
  hasOwnProperty,
  isControlledProp,
} from './utils';

import getProps from './common/props';
import getInitialData from './common/data';
import computed from './common/computed';
import methods from './common/methods/methods';
import slot from './common/slot';
import beforeCreate from './common/beforeCreate';
import * as sct from './stateChangeTypes';

const isVue3 = !!defineComponent;
if (!isVue3 && process.env.NODE_ENV !== 'production') {
  console.error(`Looks like your Vue version is 2.x, but you are using VueComboBlocks for Vue 3.
Install the correct version for Vue 2.x: "npm i vue-combo-blocks@vue2"`);
}

const VueComboBlocks = defineComponent({
  name: 'vue-combo-blocks',
  emits: {
    select: null,
    'update:modelValue': null,
    'input-value-change': null,
    'is-open-change': null,
    'hovered-index-change': null,
    'state-change': null,
    change: null,
    'show-list': null,
    focus: null,
    hover: null,

  },
  props: getProps(isVue3),
  watch: {
    modelValue(newValue) {
      if (isControlledProp(this.$props, 'modelValue')) {
        // Quietly set the internal state
        this.inputValue = this.itemToString(newValue);
        this.selectedItem = newValue;
      }
    },
  },
  beforeCreate,
  data() {
    return getInitialData(this.modelValue, this.itemToString);
  },
  computed: {
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
          this.$emit('update:modelValue', newState.selectedItem, type);
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
    return this.$slots.default(slot(this));
  },
});

VueComboBlocks.stateChangeTypes = sct;
export default VueComboBlocks;
