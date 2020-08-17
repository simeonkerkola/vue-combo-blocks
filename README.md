# vue-combo-blocks

Downshift like autocomplete for Vue

```
npm i vue-combo-blocks
```

Usage

```vue
<vue-combo-blocks
  :ref="id"
  :value="value"
  :itemToString="itemToString"
  :items="filteredList"
  @input-value-change="updateList"
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
          getComboboxProps,
          clearSelection
        }"
  >
    <div v-bind="getComboboxProps()">
      <button @click="clearSelection">clear</button>
      <input v-bind="getInputProps()" placeholder="Search" v-on="getInputEventListeners()" />
      <ul
        v-show="isOpen && (list.length || !miscSlotsAreEmpty())"
        v-bind="getListProps()"
        v-on="getListEventListeners()"
      >
        <li
          v-for="(item, index) in filteredList"
          :key="item.id"
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
          {{ item.value }}
        </li>
      </ul>
    </div>
  </template>
</vue-combo-blocks>
```

```js
export default {
  components: {
    VueComboBlocks,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      filteredList: [],
      list: [
      { value: 'first', id: '123' },
      { value: 'second', id: '456' },
      { value: 'third', id: '789' },
      { value: 'duplicate', id: '789' },
      { value: 'duplicate', id: '789' },
    ]
    };
  },
  methods: {
    itemToString(item) {
      return item => (item ? item.value : "")
    },
    updateList(text) {
     this.filteredList = this.list.filter((item) => item[this.displayAttribute].includes(text));
    },
  },
};
</script>

```

## Props

| Name                  | Type     | Default                                   | description             |
| --------------------- | -------- | ----------------------------------------- | ----------------------- |
| items                 | Array    | **required**                              |                         |
| isSelectedItemChanged | Function | `(prevItem, item) => (prevItem !== item)` |                         |
| itemToString          | Function | `(item) => (item ? String(item) : '')`    |                         |
| value                 | Any      | `null`                                    | Sets the selected item. |

## Default Slot

Default slot returns prop getters, event listeners, component state and actions

### Prop getters

| Name             | Type         | Description                                                                                    |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| getComboboxProps | function({}) | returns the props you should apply to an element that wraps the input element that you render. |
| getInputProps    | function({}) | returns the props you should apply to the input element that you render.                       |
| getItemProps     | function({}) | returns the props you should apply to any menu item elements you render.                       |
| getMenuProps     | function({}) | returns the props you should apply to the ul element (or root of your menu) that you render.   |
