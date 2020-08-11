<template>
  <div :id="`${id}-autocomplete`">
    <ComboBlocks
      :ref="id"
      :value="value"
      :display-attribute="displayAttribute"
      :value-attribute="valueAttribute"
      :controls="{
        autocomplete: [] // Disable (CTRL / SHFT) + Space autocomplete.
      }"
      @change="onChange"
      @show-list="onShowList"
      @focus="onFocus"
      @hover="onHover"
    >
      <template
        v-slot="{
          getInputProps,
          getInputEventListeners,
          selected,
          hoveredIndex,
          isOpen,
          inputValue,
          getListProps,
          getListEventListeners,
          getItemProps,
          getItemEventListeners,
          getComboboxProps
        }"
      >
        <div id="combobox" v-bind="getComboboxProps()" style="width: 100%">
          <input
            :id="id"
            v-bind="getInputProps()"
            :placeholder="placeholder"
            :label="label"
            autocomplete="off"
            single-line
            v-on="getInputEventListeners()"
            @input="onInput"
          />

          <ul
            v-show="isOpen && (list.length || !miscSlotsAreEmpty())"
            class="list"
            v-bind="getListProps()"
            v-on="getListEventListeners()"
          >
            <slot name="append-item"></slot>
            <li
              v-for="(item, index) in filteredList(inputValue)"
              :key="item[valueAttribute]"
              class="list-item"
              :style="{
                backgroundColor: hoveredIndex === index ? 'lightgray' : 'white',
                fontWeight:
                  selected &&
                  selected[displayAttribute] === item &&
                  item[displayAttribute]
                    ? 'bold'
                    : 'normal'
              }"
              v-bind="getItemProps({ item, index })"
              v-on="getItemEventListeners(item)"
            >
              <span :id="`${id}-suggest-item-${item[displayAttribute]}`">
                {{ item[displayAttribute] }}
              </span>
            </li>
            <slot name="prepend-item"></slot>
          </ul>
        </div>
      </template>
    </ComboBlocks>

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
import { get } from 'lodash';
import ComboBlocks from '../../../src/combo-blocks';

export default {
  components: {
    ComboBlocks,
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
    valueAttribute: {
      type: String,
      default: 'id',
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
      // inputValue: ''
    };
  },
  computed: {
    autocompleteRef() {
      return get(this.$refs, `${this.id}`);
    },
  },
  watch: {
    value(selected) {
      // Set the input text value to the displayAttribute of the selected item.
      if (!selected) this.autocompleteRef.clearSelection();
    },
  },
  mounted() {
    if (this.value) this.autocompleteRef.select(this.value);
  },

  methods: {
    filteredList(text) {
      return this.list.filter((item) => item[this.displayAttribute].includes(text));
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
      if (this.autocompleteRef) {
        this.autocompleteRef.clearSelection();
      }

      // Send the text to vue-simple-suggest as well to trigger a research
      this.processAndShowList();
    },
    showList() {
      this.autocompleteRef.showList();
    },
    hideList() {
      this.autocompleteRef.hideList();
    },
    onInput(text) {
      // Send the input value to parent. For search etc.
      this.$emit('update:search-input', text);
      this.$emit('input', text);
    },
    onDropdownIconClick() {
      // Focus the input element, opening suggestions list and triggering onFocus()
      this.processAndShowList();
    },
    onShowList() {
      this.$nextTick(() => {
        this.repositionList();
      });
    },
    repositionList() {
      console.log('repositionList');
    },
    async processAndShowList() {
      if (this.autocompleteRef) {
        this.autocompleteRef.inputElement.focus();
        this.autocompleteRef.showList();
      }
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
