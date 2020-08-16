/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
import { mount } from '@vue/test-utils';
import ComboBlocks from '../../src/combo-blocks';

const item = { name: 'name' };
const item2 = { name: 'item 2 name' };
const items = [item, item2];
const factory = ({ propsData, scopedSlots, ...rest } = {}) => mount(ComboBlocks,
  {
    scopedSlots: {
      default: '<p></p>',
      ...scopedSlots,
    },
    propsData: {
      items,
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
  it('returns getItemProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const itemProps = wrapper.vm.getItemProps({ item: items[1] });

    expect(itemProps).toEqual(
      {
        id: `${idPrefix}-combo-blocks-item-1`,
        role: 'option',
        'aria-selected': 'false',
      },
    );
    expect(wrapper.vm.items.length).toBe(2);
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
  it('getItemEventListeners call right methods', () => {
    const wrapper = factory();
    wrapper.vm.setHoveredItem = jest.fn();
    wrapper.vm.itemClick = jest.fn();
    const fakeEvent = { target: null };

    wrapper.vm.getItemEventListeners({ item }).mouseenter(fakeEvent);
    expect(wrapper.vm.setHoveredItem).toHaveBeenLastCalledWith(item, 0, fakeEvent.target);

    wrapper.vm.getItemEventListeners({ item }).mouseleave(fakeEvent);
    expect(wrapper.vm.setHoveredItem).toHaveBeenLastCalledWith(undefined);

    wrapper.vm.getItemEventListeners({ item }).click(fakeEvent);
    expect(wrapper.vm.itemClick).toHaveBeenLastCalledWith(item, 0, fakeEvent);
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
      expect(wrapper.emitted()['input-value-change'][0]).toEqual([text]);
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
  it('sets new selected item', () => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;
    wrapper.vm.autocompleteText = jest.fn();

    wrapper.vm.select(item, wrapper.vm.hoveredIndex);

    expect(wrapper.vm.selected).toEqual(item);
    expect(wrapper.vm.selectedIndex).toBe(wrapper.vm.hoveredIndex);
    expect(wrapper.vm.autocompleteText).toHaveBeenLastCalledWith(item);
    expect(wrapper.emitted().change[0]).toEqual([item]);
  });
  it('selects same item again', () => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;
    wrapper.vm.autocompleteText = jest.fn();

    wrapper.vm.select(item, wrapper.vm.hoveredIndex);
    wrapper.vm.select(item, wrapper.vm.hoveredIndex);

    expect(wrapper.vm.selected).toEqual(item);
    expect(wrapper.vm.selectedIndex).toBe(wrapper.vm.hoveredIndex);
    expect(wrapper.vm.autocompleteText).toHaveBeenLastCalledWith(item);
    expect(wrapper.vm.autocompleteText).toHaveBeenCalledTimes(2);

    // Only call once
    expect(wrapper.emitted().change.length).toBe(1);
  });
  it('sets hovered item', () => {
    const wrapper = factory();
    wrapper.vm.getItemProps({ item });
    wrapper.vm.getItemProps({ item: item2 });
    const fakeElement = 'asdfasdf';
    const item2ofItems = wrapper.vm.items.find(({ name }) => name === item2.name);
    const item2Index = wrapper.vm.items.indexOf(item2ofItems);

    wrapper.vm.setHoveredItem(item2ofItems, item2Index, fakeElement);

    expect(wrapper.vm.hovered).toEqual(item2);
    expect(wrapper.vm.hoveredIndex).toEqual(item2Index);
    expect(wrapper.emitted().hover[0]).toEqual([item2, fakeElement]);
  });
});
