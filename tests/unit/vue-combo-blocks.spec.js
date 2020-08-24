/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
import { mount } from '@vue/test-utils';
import ComboBlocks from '../../src/vue-combo-blocks';

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
      itemToString: (i) => (i ? String(i.name) : ''),
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
        'aria-owns': `${idPrefix}-vue-combo-blocks-list`,
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
        'aria-controls': `${idPrefix}-vue-combo-blocks-list`,
        id: `${idPrefix}-vue-combo-blocks-input`,
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
        id: `${idPrefix}-vue-combo-blocks-list`,
        role: 'listbox',
        'aria-labelledby': `${idPrefix}-vue-combo-blocks-label`,
      },
    );
  });
  it('returns getLabelProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const comboboxProps = wrapper.vm.getLabelProps();
    expect(comboboxProps).toEqual(
      {
        id: `${idPrefix}-vue-combo-blocks-label`,
        for: `${idPrefix}-vue-combo-blocks-input`,
      },
    );
  });
  it('returns getItemProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm._uid;

    const itemProps = wrapper.vm.getItemProps({ item: items[1] });

    expect(itemProps).toEqual(
      {
        id: `${idPrefix}-vue-combo-blocks-item-1`,
        role: 'option',
        'aria-selected': 'false',
      },
    );
    expect(wrapper.vm.items.length).toBe(2);
  });
  // Event listeners
  it('InputEventListeners call right methods', () => {
    const wrapper = factory();

    wrapper.vm.onInputBlur = jest.fn();
    wrapper.vm.onInput = jest.fn();
    wrapper.vm.onListKeyUp = jest.fn();
    wrapper.vm.onKeyDown = jest.fn();

    wrapper.vm.getInputEventListeners().blur();
    wrapper.vm.getInputEventListeners().input();
    wrapper.vm.getInputEventListeners().keydown();
    wrapper.vm.getInputEventListeners().keyup();

    expect(wrapper.vm.onInputBlur).toHaveBeenCalled();
    expect(wrapper.vm.onInput).toHaveBeenCalled();
    expect(wrapper.vm.onListKeyUp).toHaveBeenCalled();
    expect(wrapper.vm.onKeyDown).toHaveBeenCalled();
  });
  it('getListEventListeners call right methods', () => {
    const wrapper = factory();

    wrapper.vm.hovered = item;

    wrapper.vm.getListEventListeners().mouseleave();
    expect(wrapper.vm.hovered).toBeNull();
  });
  it('getItemEventListeners call right methods', () => {
    const fakeEvent = { preventDefault: () => {} };
    const wrapper = factory();
    wrapper.vm.inputValue = '';
    wrapper.vm.selected = null;
    wrapper.vm.isOpen = true;
    wrapper.vm.hoveredIndex = 0;
    wrapper.vm.hovered = item;

    wrapper.vm.getItemEventListeners({ item }).mousemove(fakeEvent);
    expect(wrapper.vm.hovered).toEqual(item);

    wrapper.vm.getItemEventListeners({ item }).click(fakeEvent);
    expect(wrapper.vm.selected).toEqual(item);
    expect(wrapper.vm.isOpen).toEqual(false);
    expect(wrapper.vm.hovered).toEqual(null);
    expect(wrapper.vm.hoveredIndex).toEqual(-1);
    expect(wrapper.vm.inputValue).toBe(item.name);
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
  it('set right input value and emit evt', () => {
    const wrapper = factory();
    const text = 'some text';
    wrapper.vm.setState({ inputValue: text });

    expect(wrapper.emitted()['input-value-change'][0]).toEqual([text]);
  });
  it('clears the selection and emit change evt', () => {
    const wrapper = factory();

    wrapper.vm.selected = item;
    wrapper.vm.selectedIndex = 0;
    wrapper.vm.reset();

    expect(wrapper.vm.selected).toBeNull();
    expect(wrapper.vm.selectedIndex).toBe(-1);
    expect(wrapper.vm.inputValue).toBe('');
    expect(wrapper.emitted().change[0]).toEqual([null]);
  });
  it('sets new selected item', () => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;

    wrapper.vm.select(item);

    expect(wrapper.vm.selected).toEqual(item);
    expect(wrapper.emitted().change[0]).toEqual([item]);
  });
  it('selects same item again', (done) => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;
    // wrapper.vm.setState = jest.fn();

    wrapper.vm.select(item, wrapper.vm.hoveredIndex);
    wrapper.vm.select(item, wrapper.vm.hoveredIndex);

    setTimeout(() => {
      // expect(wrapper.vm.setState).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.selected).toEqual(item);
      expect(wrapper.emitted().change.length).toBe(1);
      done();
    }, 1);

    // Only call once
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
  it('opens list', () => {
    const wrapper = factory();
    wrapper.vm.isOpen = false;

    wrapper.vm.openList();

    expect(wrapper.vm.isOpen).toBe(true);
  });
  it('hides list', () => {
    const wrapper = factory();
    wrapper.vm.isOpen = true;

    wrapper.vm.closeList();

    expect(wrapper.vm.isOpen).toBe(false);
  });
});
