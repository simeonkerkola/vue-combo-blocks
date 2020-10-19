# Vue Combo Blocks 🧱

Provides all the building blocks needed for accessible autocomplete,
combobox, or typeahead component.

**_A very Downshift like autocomplete solution for Vue_**

**_Downshift for Vue.js_**

[![size][size-badge]][pundle-phobia-dist] [![gzip size][gzip-badge]][pundle-phobia-dist] [![downloads][downloads-badge]][npm-link]

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
      <button @click="reset">reset</button>
      <input v-bind="getInputProps()" v-on="getInputEventListeners()" placeholder="Search" />
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
import VueComboBlocks from 'vue-combo-blocks';

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
      this.filteredList = list.filter((item) =>
        item.value.toLowerCase().includes(text.toLowerCase()),
      );
    },
  },
};
</script>
```

## Props

| Name         | Type                                              | Default                                | description                                                                                                                                             |
| ------------ | ------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| items        | Array                                             | **required**                           |                                                                                                                                                         |
| itemToString | Function                                          | `(item) => (item ? String(item) : '')` |                                                                                                                                                         |
| value        | Any                                               | `null`                                 | Sets the selected item. Prop part of v-model                                                                                                            |
| stateReducer | Function(state: object, actionAndChanges: object) | optional                               | Very handy feature that gives you a complete control of the `vue-combo-blocks` state. Read more about it in the [State Reducer section](#state-reducer) |
| inputId      | String                                            | generated ID                           | Used for `aria` attributes and the `id` prop of the element (`input`)                                                                                   |
| labelId      | String                                            | generated ID                           | Used for `aria` attributes and the `id` prop of the element (`label`)                                                                                   |
| menuId       | String                                            | generated ID                           | Used for `aria` attributes and the `id` prop of the element (`ul`)                                                                                      |
| getItemId    | Function(index)                                   | optional                               | defaults to a function that generates an ID based on the index                                                                                          |

## Events

Emitted events return 2 parameters. First is the new value, and second is the [state change type](#stateChangeTypes).

| Name                 | Type                                                             | Description                                              |
| -------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| change               | selectedItem: Any, type: [stateChangeType](#stateChangeTypes)    | Emitted when the selected item changes                   |
| input-value-change   | inputValue: String, type: [stateChangeType](#stateChangeTypes)   | Emitted when the input value changes                     |
| is-open-change       | isOpen: Boolean, type: [stateChangeType](#stateChangeTypes)      | Emitted when the isOpen value changes                    |
| hovered-index-change | hoveredIndex: Number, type: [stateChangeType](#stateChangeTypes) | Emitted when the hoveredIndex value changes              |
| state-change         | state:Object, type: [stateChangeType](#stateChangeTypes)         | Emitted when the state changes. Contains all the changes |

## Default Slot & returned props

Default slot's scope contains: prop getters, event listeners, component state and actions.

### Prop getters

Bind the prop getters to their elements with `v-bind` and event listeners with
`v-on`. You can add your own event listeners to these elements too and any other props needed.

```html
<input v-bind="getInputProps()" v-on="getInputEventListeners()" />
```

| Name             | Type                                                      | Description                                                                                               |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| getComboboxProps | function()                                                | returns the props you should apply to an element that wraps the input element that you render.            |
| getInputProps    | function()                                                | returns the props you should apply to the input element that you render.                                  |
| getLabelProps    | function()                                                | returns the props you should apply to the label element that you render.                                  |
| getItemProps     | function({ item: any, index: number, disabled: boolean }) | returns the props you should apply to any menu item elements you render. `item` property is **required**! |
| getMenuProps     | function()                                                | returns the props you should apply to the ul element (or root of your menu) that you render.              |

### Event listeners

| Name                   | Type                                                      | Description                                                      |
| ---------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| getInputEventListeners | function()                                                | Bind these to the `input` element.                               |
| getItemEventListeners  | function({ item: any, index: number, disabled: boolean }) | Bind these to the `li` element. `item` property is **required**! |
| getMenuEventListeners  | function()                                                | Bind these to the `ul` element.                                  |

### State

| Name         | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| isOpen       | Boolean | the list open state         |
| selectedItem | Any     | the currently selected item |
| hoveredIndex | Number  | the currently hovered item  |
| inputValue   | String  | the value in the input      |

### Actions

| Name          | Type                         | Description                                         |
| ------------- | ---------------------------- | --------------------------------------------------- |
| reset         | function()                   | Clears the selected item, and reset the input value |
| select        | function(item: any)          | Selects an item                                     |
| setInputValue | function(inputValue: string) | Sets the input value                                |
| openMenu      | function()                   | Opens the menu                                      |
| closeMenu     | function()                   | Closes the menu                                     |

## State Reducer

`function(state: object, actionAndChanges: object`
This function is called each time `vue-combo-blocks` sets its internal state.
It gives you the current state and the state that will be set, and you return the state that you want to set.

- `state`: The full current state of vue-combo-blocks.
- `actionAndChanges`: Object that contains the action type, props needed to return a new state based on that type and the changes suggested by the vue-combo-blocks default reducer. About the type property you can learn more about in the [stateChangeTypes section](#stateChangeTypes).

In this example, we want to keep the menu open after the item is selected,
and keep the input value empty

```vue
<template>
  <vue-combo-blocks :stateReducer="stateReducer" ****>
    ****
  </vue-combo-blocks>
</template>
```

```javascript
  methods: {
    stateReducer(oldState, { changes, type }) {
      switch (type) {
        case VueComboBlocks.stateChangeTypes.InputKeyUpEnter:
        case VueComboBlocks.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
            inputValue: '',
          };
        default:
          return changes;
      }
    },
  }
```

## stateChangeTypes

The list of all possible values this `type` property can take is defined in [this file](https://github.com/sssmi/vue-combo-blocks/blob/master/src/stateChangeTypes.js) and is as follows:

- `VueComboBlocks.stateChangeTypes.InputKeyDownArrowDown`
- `VueComboBlocks.stateChangeTypes.InputKeyDownArrowUp`
- `VueComboBlocks.stateChangeTypes.InputKeyDownTab`
- `VueComboBlocks.stateChangeTypes.InputKeyUpEscape`
- `VueComboBlocks.stateChangeTypes.InputKeyUpEnter`
- `VueComboBlocks.stateChangeTypes.InputChange`
- `VueComboBlocks.stateChangeTypes.InputBlur`
- `VueComboBlocks.stateChangeTypes.ItemMouseLeave`
- `VueComboBlocks.stateChangeTypes.ItemMouseMove`
- `VueComboBlocks.stateChangeTypes.ItemClick`
- `VueComboBlocks.stateChangeTypes.FunctionOpenMenu`
- `VueComboBlocks.stateChangeTypes.FunctionCloseMenu`
- `VueComboBlocks.stateChangeTypes.FunctionSelectItem`
- `VueComboBlocks.stateChangeTypes.FunctionSetInputValue`
- `VueComboBlocks.stateChangeTypes.FunctionReset`

[downloads-badge]: https://img.shields.io/npm/dm/vue-combo-blocks?color=indigo
[gzip-badge]: https://img.shields.io/bundlephobia/minzip/vue-combo-blocks?color=blue&label=gzipped
[size-badge]: https://img.shields.io/bundlephobia/min/vue-combo-blocks?color=seagreen&label=minified
[pundle-phobia-dist]: https://bundlephobia.com/result?p=vue-combo-blocks
[npm-link]: https://www.npmjs.com/package/vue-combo-blocks
