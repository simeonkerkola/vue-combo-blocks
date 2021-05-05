# Change Log

## 0.4.0 (2021-05-5)

### New

- Scroll hovered item into view. Can be disabled with `scrollIntoView` prop.

## 0.3.0 (2021-04-26)

### Breaking change

- `change` event is now emitted only if new item is selected. Use `select` event in other use cases

### New

- Emit `select` event when item is selected. Even if the item is same as previously selected item.
