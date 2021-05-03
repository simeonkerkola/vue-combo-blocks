<template>
  <div :id="`${id}-autocomplete`">
    <VueComboBlocks
      :ref="id"
      v-model="selected"
      :itemToString="itemToString"
      :items='filteredList'
      @change="onChange"
      @show-list="onShowList"
      @focus="onFocus"
      @hover="onHover"
      @input-value-change="onInput"
      :stateReducer="stateReducer"
      v-slot="{
        getInputProps,
        getInputEventListeners,
        selectedItem,
        hoveredIndex,
        isOpen,
        inputValue,
        getMenuProps,
        getMenuEventListeners,
        getItemProps,
        getItemEventListeners,
        getComboboxProps,
        reset
      }"
      >
      <div id="combobox" v-bind="getComboboxProps()" style="width: 100%">
        <h2>Controlled Prop</h2>
          <button @click="reset" data-testid="clear-button">clear</button>
          <button @click="next(selectedItem)" data-testid="clear-button">select next</button>
        <input
          data-testid="combobox-input"
          :id="id"
          v-bind="getInputProps()"
          placeholder="Search"
          :label="label"
          autocomplete="off"
          single-line
          v-on="getInputEventListeners()"
        />
        <ul
          v-show="isOpen"
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
            :class="{'selected':selectedItem  === item, 'hovered':hoveredIndex === index}"
            :style="{
              backgroundColor: hoveredIndex === index ? 'lightgray' : 'white',
              fontWeight:
                selectedItem  === item
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

    <h3>{{selected ? selected.displayName: 'Nothing'}}</h3>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import VueComboBlocks from '../../src/vue-combo-blocks';

const list = [
  { displayName: 'first', id: '123' },
  { displayName: 'second', id: '456' },
  { displayName: 'third', id: '789' },
  { displayName: 'duplicate', id: '789' },
  { displayName: 'duplicate', id: '789' },
];

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
      default: 'listId',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      // Object or null
      validator: (prop) => typeof prop === 'object',
      default: null,
    },
    displayAttribute: {
      type: String,
      default: 'displayName',
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
      filteredList: list,
      selected: null,
    };
  },
  computed: {
    autocompleteRef() {
      return this.$refs[`${this.id}`];
    },
  },
  watch: {

  },
  mounted() {
    // if (this.value) this.autocompleteRef.select(this.value);
  },

  methods: {
    stateReducer(oldState, { changes }) {
      // console.log({ type });
      return changes;
    },
    next(selectedItem) {
      // clear the list
      this.setFilteredList('');

      // Select next or first item
      const next = this.filteredList[this.filteredList.indexOf(selectedItem) + 1]
        ? this.filteredList[this.filteredList.indexOf(selectedItem) + 1]
        : this.filteredList[0];

      this.selected = next;
    },
    itemToString(item) {
      return item ? item[this.displayAttribute] : '';
    },
    setFilteredList(text) {
      this.filteredList = list.filter((item) => item[this.displayAttribute].includes(text));
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
        // this.autocompleteRef.clearSelection();
      }

      // Send the text to vue-simple-suggest as well to trigger a research
      this.processAndShowList();
    },
    showList() {
      // this.autocompleteRef.showList();
    },
    hideList() {
      // this.autocompleteRef.hideList();
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
    onShowList() {
      this.$nextTick(() => {
        this.repositionList();
      });
    },
    repositionList() {

    },
    async processAndShowList() {
      // if (this.autocompleteRef) {
      //   this.autocompleteRef.inputElement.focus();
      //   this.autocompleteRef.showList();
      // }
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
<style>
.list {
  margin: 0 auto;
  max-width: 400px;
  border: 1px solid;
}
</style>
