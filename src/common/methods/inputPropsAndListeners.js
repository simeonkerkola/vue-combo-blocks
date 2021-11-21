import * as sct from '../../stateChangeTypes';
import {
  isFn,
  controls,
  hasKeyCode,
} from '../../utils';

export default {
  getInputProps() {
    return {
      value: this.inputValue || '',
      'aria-activedescendant': this.hovered ? this.getItemId(this.hoveredIndex) : '',
      'aria-autocomplete': 'list',
      'aria-controls': this.computedMenuId,
      'aria-labelledby': this.computedLabelId,
      id: this.computedInputId,
      autocomplete: 'off',
    };
  },
  getInputEventListeners({
    blur,
    input,
    keydown,
    keyup,
  } = {}) {
    return {
      blur: isFn(blur) ? blur : this.onInputBlur,
      input: isFn(input) ? input : this.onInput,
      keydown: isFn(keydown) ? keydown : this.onInputKeyDown,
      keyup: isFn(keyup) ? keyup : this.onInputKeyUp,
    };
  },
  onInputKeyDown(e) {
    // prevent form submit on keydown if Enter key registered in the keyup
    if (e.key === 'Enter' && this.isOpen) {
      e.preventDefault();
    // } else if (e.key === 'Tab' && this.hovered) {
    //   this.setState({
    //     inputValue: this.itemToString(this.hovered),
    //     selectedItem: this.hovered,
    //     isOpen: false,
    //   }, sct.InputKeyDownTab);
    } else if (hasKeyCode(controls.arrowDownKey, e) && !this.isOpen) {
      this.setState({ isOpen: true }, sct.InputKeyDownArrowDown);
      this.moveSelection(e);
    } else this.moveSelection(e);
  },
  onInputKeyUp(e) {
    const { enterKey, escKey } = controls;
    if (this.isOpen) {
      if (hasKeyCode(enterKey, e)) {
        if (this.hoveredIndex >= 0) {
          e.preventDefault();
          const itemNode = this.getItemNodeFromIndex(this.hoveredIndex);
          if (itemNode && itemNode.hasAttribute('disabled')) {
            return;
          }
          this.setState({
            inputValue: this.itemToString(this.hovered),
            selectedItem: this.hovered,
            hoveredIndex: -1,
            hovered: null,
            isOpen: false,
          }, sct.InputKeyUpEnter);
        }
      } else if (hasKeyCode(escKey, e)) {
        this.setState({
          hoveredIndex: -1,
          hovered: null,
          isOpen: false,
        }, sct.InputKeyUpEscape);
      }
    }
  },
  onInputBlur() {
    this.setState({
      isOpen: false,
      inputValue: this.itemToString(this.selectedItem),
      hovered: null,
      hoveredIndex: -1,
    }, sct.InputBlur);
  },
  onInput(e) {
    console.log('native input', { e });
    // Custom input component might return just the value
    const inputValue = e.target ? e.target.value : e;
    this.setState({
      inputValue,
      hovered: null,
      isOpen: true,
    },
    sct.InputChange);
  },
};
