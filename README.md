# Vue Combo Blocks 🧰

**_A very Downshift like autocomplete solution for Vue_**

Provides all the building blocks needed for accessible autocomplete,
combobox, or typeahead component.

## The problem

You want to build an autocomplete/combobox component, and it needs to be
accessible, lightweight and you don't really want extra dependencies or styling
you would not use, or you'd have to hack around to to make it your own.

## The solution

This library provides you the state and the controls for your combobox.
You provide the elements and styles to build the thing you
need.

## Usage

[Try it out in codesandbox](https://codesandbox.io/s/autocomplete-with-vue-combo-blocks-ejpur?file=/src/components/Autocomplete.vue)

```vue
<template>
  <vue-combo-blocks
    v-model="selected"
    :itemToString="itemToString"
    :items="filteredList"
    @input-value-change="updateList"
    v-slot="{
      getInputProps,
      getInputEventListeners,
      selected,
      hoveredIndex,
      isOpen,
      getMenuProps,
      getMenuEventListeners,
      getItemProps,
      getItemEventListeners,
      getComboboxProps,
      clearSelection,
    }"
  >
    <div v-bind="getComboboxProps()">
      <button @click="clearSelection">clear</button>
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
        >
          {{ item.value }}
        </li>
      </ul>
    </div>
  </vue-combo-blocks>
</template>

<script>
import VueComboBlocks from "vue-combo-blocks";
export default {
  components: {
    VueComboBlocks
  },
  data() {
    return {
      selected: null,
      filteredList: [],
      list: [
        { value: "Gretsch", id: "1" },
        { value: "Ludwig", id: "2" },
        { value: "Mapex", id: "3" },
        { value: "Pearl", id: "4" },
        { value: "Sonor", id: "5" },
        { value: "Tama", id: "6" },
        { value: "Zildjian", id: "7" }
      ]
    };
  },
  methods: {
    itemToString(item) {
      return item ? item.value : "";
    },
    updateList(text) {
      this.filteredList = this.list.filter(item => item.value.includes(text));
    }
  }
};
</script>
```

## Props

| Name                  | Type     | Default                                   | description                                  |
| --------------------- | -------- | ----------------------------------------- | -------------------------------------------- |
| items                 | Array    | **required**                              |                                              |
| isSelectedItemChanged | Function | `(prevItem, item) => (prevItem !== item)` |                                              |
| itemToString          | Function | `(item) => (item ? String(item) : '')`    |                                              |
| value                 | Any      | `null`                                    | Sets the selected item. Prop part of v-model |

## Events

| Name               | Type   | Description                            |
| ------------------ | ------ | -------------------------------------- |
| change             | Any    | Emitted when the selected item changes |
| input-value-change | String | Emitted when the input value changes   |

## Default Slot & returned props

Default slot's scope contains: prop getters, event listeners, component state and actions.

### Prop getters

Bind the prop getters to their elements with `v-bind` and event listeners with
`v-on`. You can add your own event listeners to these elements too and any other props needed.

```html
<input v-bind="getInputProps()" v-on="getInputEventListeners()" />
```

| Name             | Type                                   | Description                                                                                               |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| getComboboxProps | function()                             | returns the props you should apply to an element that wraps the input element that you render.            |
| getInputProps    | function()                             | returns the props you should apply to the input element that you render.                                  |
| getItemProps     | function({ item: any, index: number }) | returns the props you should apply to any menu item elements you render. `item` property is **required**! |
| getMenuProps     | function()                             | returns the props you should apply to the ul element (or root of your menu) that you render.              |

### Event listeners

| Name                   | Type                                   | Description                                                      |
| ---------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| getInputEventListeners | function()                             | Bind these to the `input` element.                               |
| getItemEventListeners  | function({ item: any, index: number }) | Bind these to the `li` element. `item` property is **required**! |
| getMenuEventListeners  | function()                             | Bind these to the `ul` element.                                  |

### State

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| isOpen       | Boolean | the list open state         |
| selected     | Any     | the currently selected item |
| hoveredIndex | Number  | the currently hovered item  |
| inputValue   | String  | the value in the input      |

### Actions

| Name           | Type       | Description                                         |
| -------------- | ---------- | --------------------------------------------------- |
| clearSelection | function() | Clears the selected item, and reset the input value |
