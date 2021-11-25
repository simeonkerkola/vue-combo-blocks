export default {
  menuElement() { return document.querySelector(`#${this.computedMenuId}`); },
  computedMenuId() { return this.menuId || `v-${this.idCounter}-vue-combo-blocks-menu`; },
  computedInputId() { return this.inputId || `v-${this.idCounter}-vue-combo-blocks-input`; },
  computedLabelId() { return this.labelId || `v-${this.idCounter}-vue-combo-blocks-label`; },
  selectedIndex() { return this.items.indexOf(this.selectedItem); },
};
