<template>
  <vue-combo-blocks
    v-model="selected"
    :itemToString="itemToString"
    :items="filteredList"
    @input-value-change="updateList"
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
      reset,
    }"
  >
    <div v-bind="getComboboxProps()">
      <h2>Simple seach</h2>
      <button @click="reset">reset</button>
      <input v-bind="getInputProps()" v-on="getInputEventListeners()" placeholder="Search">
      <ul v-show="isOpen" v-bind="getMenuProps()" v-on="getMenuEventListeners()">
        <li
          v-for="(item, index) in filteredList"
          :key="item.id"
          :style="{
            backgroundColor: hoveredIndex === index ? 'lightgray' : 'white',
            fontWeight: selected === item ? 'bold' : 'normal',
          }"
          v-bind="getItemProps({ item, index })"
          v-on="getItemEventListeners({ item, index })"
        >{{ item.value }}</li>
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
      selected: null,
      filteredList: list,
    };
  },
  methods: {
    itemToString(item) {
      return item ? item.value : '';
    },
    // This could be a call to an api that returns the options
    updateList(text) {
      this.filteredList = list.filter((item) => item.value.toLowerCase()
        .includes(text.toLowerCase()));
    },
  },
};
</script>
