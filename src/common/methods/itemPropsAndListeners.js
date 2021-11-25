import * as sct from '../../stateChangeTypes';
import {
  isFn,
  getItemIndex,
  requiredProp,
} from '../../utils';

export default {
  getItemEventListeners({
    index,
    disabled,
    item = process.env.NODE_ENV === 'production' ? undefined
      : requiredProp('getItemEventListeners', 'item'),
    mousemove,
    mousedown,
    click,
  } = {}) {
    if (disabled) return {};
    return {
      mousemove: isFn(mousemove) ? mousemove : () => this.onItemMouseMove(index, item),
      mousedown: isFn(mousedown) ? mousedown : this.onItemMouseDown,
      click: isFn(click) ? click : () => this.onItemClick(item),
    };
  },
  onItemMouseMove(index, item) {
    const itemIndex = getItemIndex(index, item, this.items);
    if (this.hoveredIndex === itemIndex) return;
    this.setState({
      hoveredIndex: itemIndex,
      hovered: item,
    }, sct.ItemMouseMove);
  },
  onItemMouseDown(e) {
    e.preventDefault();
  },
  onItemClick(item) {
    // e.preventDefault();
    this.setState({
      inputValue: this.itemToString(item),
      selectedItem: item,
      isOpen: false,
      hoveredIndex: -1,
      hovered: null,
    }, sct.ItemClick);
  },
  getItemProps({
    index,
    disabled,
    item = process.env.NODE_ENV === 'production' ? undefined
      : requiredProp('getItemProps', 'item'),
  } = {}) {
    const itemIndex = getItemIndex(index, item, this.items);
    const id = this.getItemId(itemIndex);
    return {
      id,
      disabled,
      role: 'option',
      'aria-selected': this.hoveredIndex === itemIndex || this.selectedItem === item ? 'true' : 'false',
    };
  },
};
