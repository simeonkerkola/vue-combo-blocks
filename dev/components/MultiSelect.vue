<template>
  <div :id="`${id}-autocomplete`">
    <VueComboBlocks
      :ref="id"
      :value="value"
      :itemToString="itemToString"
      :items='filteredList'
      @change="onChange"
      @focus="onFocus"
      @hover="onHover"
      :stateReducer="stateReducer"
      @input-value-change="onInput"
      v-slot="{
        getInputProps,
        getInputEventListeners,
        selected,
        hoveredIndex,
        isOpen,
        inputValue,
        getMenuProps,
        getMenuEventListeners,
        getItemProps,
        getItemEventListeners,
        getComboboxProps,
        clearSelection
      }"
      >
      <div id="combobox" v-bind="getComboboxProps()" style="width: 100%">
          <button @click="clearSelection" data-testid="clear-button">clear</button>
        <input
          data-testid="combobox-input"
          :id="id"
          v-bind="getInputProps()"
          :placeholder="placeholder"
          :label="label"
          autocomplete="off"
          single-line
          v-on="getInputEventListeners()"
        />
        <ul
          v-show="isOpen && (list.length || !miscSlotsAreEmpty())"
          class="list"
          v-bind="getMenuProps()"
          v-on="getMenuEventListeners()"
        >
          <li v-if="!filteredList.length" data-testid="no-results">
            No results
          </li>
          <li
          :data-testid="`vue-combo-blocks-item-${index}`"
            v-for="(item, index) in filteredList"
            :key="index"
            class="list-item"
            :class="{'selected':selected  === item, 'hovered':hoveredIndex === index}"
            :style="{
              backgroundColor: hoveredIndex === index ? 'lightgray' : 'white',
              fontWeight:
                selected  === item
                  ? 'bold'
                  : 'normal'
            }"
            v-bind="getItemProps({ item, index })"
            v-on="getItemEventListeners({ item, index })"
          >
            <span :id="`${id}-suggest-item-${item[displayAttribute]}`">
              {{ item[displayAttribute] }}
            </span>
          </li>
          <slot name="prepend-item"></slot>
        </ul>
      </div>
    </VueComboBlocks>

    <button
      v-if="cancelButton && !!value"
      :id="`${id}-cancel`"
      label="cancel"
      @click="onCancel"
    >
      cancel
    </button>

    <button
      v-if="dropdownIcon"
      :id="`${id}-dropdown`"
      label="dropdown"
      @click="onDropdownIconClick"
    >
      open
    </button>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import VueComboBlocks, { stateChangeTypes } from '../../src/vue-combo-blocks';

export default {
  components: {
    VueComboBlocks,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    list: {
      type: [Array, Function],
      required: true,
    },
    value: {
      // Object or null
      validator: (prop) => typeof prop === 'object',
      default: null,
    },
    displayAttribute: {
      type: String,
      default: 'name',
    },
    cancelButton: {
      type: Boolean,
      default: false,
    },
    dropdownIcon: {
      type: Boolean,
      default: false,
    },
    debounce: {
      type: Number,
      default: 0,
    },
    clearAfterSelect: {
      type: Boolean,
      default: false,
    },
    searchInput: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      filteredList: this.list,
    };
  },
  watch: {

  },

  methods: {
    stateReducer(oldState, { changes, type }) {
      switch (type) {
        case stateChangeTypes.InputKeyUpEnter:
        case stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
            inputValue: '',
          };
        default:
          return changes;
      }
    },
    itemToString(item) {
      return item ? item[this.displayAttribute] : '';
    },
    setFilteredList(text) {
      console.log({ text });
      this.filteredList = this.list.filter((item) => item[this.displayAttribute].includes(text));
    },
    onHover(suggestion, element) {
      if (!element) {
        this.$nextTick(() => {
          const overlayElement = this.$refs[this.id].$el.querySelector('.list');
          const hoveredElement = this.$refs[this.id].$el.querySelectorAll('.list-item')[
            this.$refs[this.id].hoveredIndex
          ];

          this.scrollToElement(hoveredElement, overlayElement);
        });
      }
      this.$emit('hover', suggestion, element);
    },
    scrollToElement(element, parentElement) {
      if (parentElement && parentElement.contains(element)) {
        const { clientHeight, scrollTop } = parentElement;
        const { offsetHeight, offsetTop } = element;

        if (offsetTop < scrollTop) {
          // If scrilled down past the last item, scroll all the way to the top
          if (this.$refs[this.id].hoveredIndex === 0) parentElement.scrollTop = 0;
          else parentElement.scrollTop = offsetTop; // scroll up
        } else {
          const offsetBottom = offsetTop + offsetHeight;
          const scrollBottom = scrollTop + clientHeight;
          if (offsetBottom > scrollBottom) {
            parentElement.scrollTop = offsetBottom - clientHeight; // scroll down
          }
        }
      }
    },
    onFocus() {
      // Select the text inside input to make it easier to clear
      this.$refs[this.id].$el.querySelector('input').select();
      // this.processAndShowList()
    },
    onChange(suggest) {
      this.$emit('change', suggest);
      if (this.clearAfterSelect) {
        setTimeout(() => {
          this.onCancel();
        }, 0);
      }
    },
    onCancel() {
      this.$emit('change', null);

      // Send the text to vue-simple-suggest as well to trigger a research
      this.processAndShowList();
    },
    onInput(text) {
      this.setFilteredList(text);
      // Send the input value to parent. For search etc.
      this.$emit('update:search-input', text);
      this.$emit('input', text);
    },
    onDropdownIconClick() {
      // Focus the input element, opening suggestions list and triggering onFocus()
      this.processAndShowList();
    },
    isScopedSlotEmpty(slot) {
      if (slot) {
        const vNode = slot(this);
        return !(Array.isArray(vNode) || (vNode && (vNode.tag || vNode.context
            || vNode.text || vNode.children)));
      }
      return true;
    },
    miscSlotsAreEmpty() {
      const slots = ['append-item', 'prepend-item'].map((s) => this.$scopedSlots[s]);
      if (slots.every((s) => !!s)) {
        return slots.every(this.isScopedSlotEmpty.bind(this));
      }
      const slot = slots.find((s) => !!s);
      return this.isScopedSlotEmpty.call(this, slot);
    },
  },
};
</script>
