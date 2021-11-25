import * as sct from '../../stateChangeTypes';
import {
  isFn,
} from '../../utils';

export default {
  getMenuProps() {
    return {
      id: this.computedMenuId,
      role: 'listbox',
      'aria-labelledby': this.computedLabelId,
    };
  },
  getMenuEventListeners({
    mouseleave,
    mousedown,
  } = {}) {
    return {
      mouseleave: isFn(mouseleave) ? mouseleave : this.onMenuMouseLeave,
      mousedown: isFn(mousedown) ? mousedown : this.onMenuMouseDown,
    };
  },
  onMenuMouseLeave() {
    this.setState({
      hoveredIndex: -1,
      hovered: null,
    }, sct.MenuMouseLeave);
  },
  onMenuMouseDown(e) {
    // TODO: Prevent menu to close when clicking something
    // on a menu but not necessarily menu item.
    // This does the trick, but now you can't select and copy any text
    // in the menu.
    e.preventDefault();
  },
};
