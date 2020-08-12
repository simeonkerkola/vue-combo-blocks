/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
import { mount } from '@vue/test-utils';
import ComboBlocks from '../../src/combo-blocks';

const item = { name: 'name' };
const factory = ({ propsData, scopedSlots, ...rest } = {}) => mount(ComboBlocks,
  {
    scopedSlots: {
      default: '<p></p>',
      ...scopedSlots,
    },
    propsData: {
      id: 'listId',
      displayAttribute: 'displayName',
      valueAttribute: 'id',
      ...propsData,
    },
    ...rest,
  });

describe('comboblocks.js', () => {
  it('does render', () => {
    const wrapper = factory();
    expect(wrapper.vm).toBeDefined();
  });

  // Props
  it('returns getComboboxProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const comboboxProps = wrapper.vm.getComboboxProps();
    expect(comboboxProps).toEqual(
      {
        role: 'combobox',
        'aria-haspopup': 'listbox',
        'aria-owns': `${idPrefix}-combo-blocks-list`,
        'aria-expanded': 'false',
      },
    );
  });
  it('returns getInputProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const comboboxProps = wrapper.vm.getInputProps();
    expect(comboboxProps).toEqual(
      {
        value: '',
        'aria-activedescendant': '',
        'aria-autocomplete': 'list',
        'aria-controls': `${idPrefix}-combo-blocks-list`,
        id: `${idPrefix}-combo-blocks-input`,
        autocomplete: 'off',
      },
    );
  });
  it('returns getListProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const comboboxProps = wrapper.vm.getListProps();
    expect(comboboxProps).toEqual(
      {
        id: `${idPrefix}-combo-blocks-list`,
        role: 'listbox',
        'aria-labelledby': `${idPrefix}-combo-blocks-label`,
      },
    );
  });
  it('returns getLabelProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const comboboxProps = wrapper.vm.getLabelProps();
    expect(comboboxProps).toEqual(
      {
        id: `${idPrefix}-combo-blocks-label`,
        for: `${idPrefix}-combo-blocks-input`,
      },
    );
  });
  it('returns getItemProps and pushes item to items', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;
    const item = { name: 'First', id: '123' };
    const itemProps = wrapper.vm.getItemProps(item);
    expect(itemProps).toEqual(
      {
        id: `${idPrefix}-combo-blocks-item-0`,
        role: 'option',
        'aria-selected': 'false',
      },
    );
    expect(wrapper.vm.items.length).toBe(1);
  });
  // Event listeners
  it('InputEventListeners call right methods', () => {
    const wrapper = factory();

    wrapper.vm.onBlur = jest.fn();
    wrapper.vm.onInput = jest.fn();
    wrapper.vm.onListKeyUp = jest.fn();
    wrapper.vm.onFocus = jest.fn();
    wrapper.vm.onKeyDown = jest.fn();

    wrapper.vm.getInputEventListeners().blur();
    wrapper.vm.getInputEventListeners().focus();
    wrapper.vm.getInputEventListeners().input();
    wrapper.vm.getInputEventListeners().keydown();
    wrapper.vm.getInputEventListeners().keyup();

    expect(wrapper.vm.onBlur).toHaveBeenCalled();
    expect(wrapper.vm.onInput).toHaveBeenCalled();
    expect(wrapper.vm.onListKeyUp).toHaveBeenCalled();
    expect(wrapper.vm.onFocus).toHaveBeenCalled();
    expect(wrapper.vm.onKeyDown).toHaveBeenCalled();
  });
  it('getListEventListeners call right methods', () => {
    const wrapper = factory();

    wrapper.vm.hoverList = jest.fn();

    wrapper.vm.getListEventListeners().mouseenter();
    expect(wrapper.vm.hoverList).toHaveBeenLastCalledWith(true);

    wrapper.vm.getListEventListeners().mouseleave();
    expect(wrapper.vm.hoverList).toHaveBeenLastCalledWith(false);
  });

  // helpers
  it('isSelected true', () => {
    const wrapper = factory();
    wrapper.vm.selectedIndex = 1;
    const isSelected = wrapper.vm.isSelected(1);
    expect(isSelected).toBe(true);
  });
  it('isSelected false', () => {
    const wrapper = factory();
    wrapper.vm.selectedIndex = 1;
    const isSelected = wrapper.vm.isSelected(0);
    expect(isSelected).toBe(false);
  });
  it('autocomplete calls setInputValue and itemToString', () => {
    const wrapper = factory({ propsData: { itemToString: jest.fn(() => 'name') } });
    wrapper.vm.setInputValue = jest.fn();

    wrapper.vm.autocompleteText(item);
    expect(wrapper.vm.setInputValue).toHaveBeenLastCalledWith('name');
    expect(wrapper.vm.itemToString).toHaveBeenLastCalledWith(item);
  });
  it('set right input value and emit evt', (done) => {
    const wrapper = factory();
    const text = 'some text';
    wrapper.vm.setInputValue(text);

    // No input immedeately
    expect(wrapper.emitted().input).toBeUndefined();
    wrapper.vm.$nextTick(() => {
    // input after next tick
      expect(wrapper.emitted().input[0]).toEqual([text]);
      done();
    });
  });
  it('clears the selection and emit change evt', () => {
    const wrapper = factory();

    wrapper.vm.selected = item;
    wrapper.vm.selectedIndex = 0;
    wrapper.vm.setInputValue = jest.fn();

    wrapper.vm.clearSelection();

    expect(wrapper.vm.selected).toBeNull();
    expect(wrapper.vm.selectedIndex).toBe(-1);
    expect(wrapper.vm.setInputValue).toHaveBeenLastCalledWith('');
    expect(wrapper.emitted().change[0]).toEqual([null]);
  });
});
