# Change Log

## 1.0.1 (2021-10-8)
### Fixed

- Warning when compiling: `"export 'defineComponent' was not found in 'vue'` [Issue 24](https://github.com/sssmi/vue-combo-blocks/issues/24) 

## 1.0.0 (2021-7-6)
### New

Vue 3 support when using @next tag:

`npm i vue-combo-blocks@next`

### Changed
**Removed:**
- `ItemMouseLeave` state change type
- Dropped support for IE11. (Unless you use babel, or similar to polyfill Object.assign)

**Added:**
- `MenuMouseLeave` state change type
- `circular` prop controls what happens when navigation with arrow keys and list bottom or top is reached.

## 0.4.1 (2021-05-5)

### New

- Use terser for minified build.
## 0.4.0 (2021-05-5)

### New

- Scroll hovered item into view. Can be disabled with `scrollIntoView` prop.

## 0.3.0 (2021-04-26)

### Breaking change

- `change` event is now emitted only if new item is selected. Use `select` event in other use cases

### New

- Emit `select` event when item is selected. Even if the item is same as previously selected item.
