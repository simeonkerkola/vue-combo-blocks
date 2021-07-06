export default function slot(vm) {
  return {
  // prop getters
    getInputProps: vm.getInputProps,
    getItemProps: vm.getItemProps,
    getMenuProps: vm.getMenuProps,
    getComboboxProps: vm.getComboboxProps,
    getLabelProps: vm.getLabelProps,

    // event listeners
    getInputEventListeners: vm.getInputEventListeners,
    getMenuEventListeners: vm.getMenuEventListeners,
    getItemEventListeners: vm.getItemEventListeners,

    // state
    isOpen: vm.isOpen,
    selectedItem: vm.selectedItem,
    hoveredIndex: vm.hoveredIndex,
    inputValue: vm.inputValue,

    // actions
    reset: vm.reset,
    select: vm.select,
    setInputValue: vm.setInputValue,
    openMenu: vm.openMenu,
    closeMenu: vm.closeMenu,
  };
}
