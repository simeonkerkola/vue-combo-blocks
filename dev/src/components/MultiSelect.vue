<template>
  <vue-combo-blocks
   :model-value='null'
    :itemToString="itemToString"
    :items="filteredList"
    :stateReducer='stateReducer'
    @input-value-change="updateList"
    @select="handleSelectedItemChange"
    v-slot:default="{
      getInputProps,
      getInputEventListeners,
      hoveredIndex,
      isOpen,
      getMenuProps,
      getMenuEventListeners,
      getItemProps,
      getItemEventListeners,
      getComboboxProps,
      selectedItem,
      reset,
    }"
  >
    <div v-bind="getComboboxProps()">
      <h2>MultiSelect</h2>
      <button data-testid="clear-button" @click="reset">reset</button>
      <input data-testid='multiselect-input'
      v-bind="getInputProps()" v-on="getInputEventListeners()" placeholder="Search">
      <ul v-show="isOpen" v-bind="getMenuProps()" v-on="getMenuEventListeners()">
        <li
          v-for="(item, index) in filteredList"
          :key="item.id"
          :data-testid="`vue-combo-blocks-item-${index}`"
          :class="{selected: selectedItems.includes(item) ? 'bold' : 'normal'}"
          :style="{
            backgroundColor: hoveredIndex === index ? 'lightgray' : 'white',
            fontWeight: selectedItems.includes(item) ? 'bold' : 'normal',
          }"
          v-bind="getItemProps({ item, index })"
          v-on="getItemEventListeners({ item, index })"
        >
        <input
          type="checkbox"
          :checked='selectedItems.includes(item) '
          :value='item'
          />
          {{ item.value }}</li>
      </ul>
      <h3>Selected items:</h3>
      <ul data-testid='selected-items'>
        <li :key="item.id" v-for="item in selectedItems">
          {{item.value}}
        </li>
      </ul>
    </div>
  </vue-combo-blocks>
</template>

<script>
import VueComboBlocks from '../../../src/vue-combo-blocks';

// This list could come from an external api
const list = [
  { value: 'Gretsch', id: '1' },
  { value: 'Ludwig', id: '2' },
  { value: 'Mapex', id: '3' },
  { value: 'Pearl', id: '4' },
  { value: 'Sonor', id: '5' },
  { value: 'Tama', id: '6' },
  { value: 'Zildjian', id: '7' },
];
export default {
  components: {
    VueComboBlocks,
  },
  data() {
    return {
      selectedItems: [],
      filteredList: list,
    };
  },
  methods: {
    itemToString(item) {
      return item ? item.value : '';
    },
    handleSelectedItemChange(selectedItem) {
      if (!selectedItem) return;

      const index = this.selectedItems.indexOf(selectedItem);

      if (index > 0) {
        this.selectedItems = [
          ...this.selectedItems.slice(0, index),
          ...this.selectedItems.slice(index + 1),
        ];
      } else if (index === 0) {
        this.selectedItems = [...this.selectedItems.slice(1)];
      } else {
        // Add item
        this.selectedItems.push(selectedItem);
      }
    },
    stateReducer(state, actionAndChanges) {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case VueComboBlocks.stateChangeTypes.InputKeyUpEnter:
        case VueComboBlocks.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep menu open after selection.
            hoveredIndex: state.hoveredIndex,
            inputValue: '', // don't add the item string as input value at selection.
          };
        case VueComboBlocks.stateChangeTypes.InputBlur:
          return {
            ...changes,
            inputValue: '', // don't add the item string as input value at selection.
          };
        default:
          return changes;
      }
    },
    // This could be a call to an api that returns the oprions
    updateList(text) {
      this.filteredList = list.filter((item) => item.value.toLowerCase()
        .includes(text.toLowerCase()));
    },
  },
};
</script>
