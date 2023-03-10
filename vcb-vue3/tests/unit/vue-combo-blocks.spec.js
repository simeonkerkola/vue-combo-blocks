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

  it('creates 3 components with different ids', () => {
    const wrapper = factory();
    const wrapper2 = factory();
    const wrapper3 = factory();
    const isGreaterThan = wrapper3.vm.idCounter > wrapper2.vm.idCounter
      && wrapper2.vm.idCounter > wrapper.vm.idCounter;
    expect(isGreaterThan).toBe(true);
  });

  // Props
  it('returns getComboboxProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm.idCounter;

    const comboboxProps = wrapper.vm.getComboboxProps();
    expect(comboboxProps).toEqual(
      {
        role: 'combobox',
        'aria-haspopup': 'listbox',
        'aria-owns': `v-${idPrefix}-vue-combo-blocks-menu`,
        'aria-expanded': 'false',
      },
    );
  });
  it('returns getInputProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm.idCounter;

    const comboboxProps = wrapper.vm.getInputProps();
    expect(comboboxProps).toEqual(
      {
        value: '',
        'aria-activedescendant': '',
        'aria-autocomplete': 'list',
        'aria-controls': `v-${idPrefix}-vue-combo-blocks-menu`,
        'aria-labelledby': `v-${idPrefix}-vue-combo-blocks-label`,
        id: `v-${idPrefix}-vue-combo-blocks-input`,
        autocomplete: 'off',
      },
    );
  });
  it('returns getMenuProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm.idCounter;

    const comboboxProps = wrapper.vm.getMenuProps();
    expect(comboboxProps).toEqual(
      {
        id: `v-${idPrefix}-vue-combo-blocks-menu`,
        role: 'listbox',
        'aria-labelledby': `v-${idPrefix}-vue-combo-blocks-label`,
      },
    );
  });
  it('returns getLabelProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm.idCounter;

    const comboboxProps = wrapper.vm.getLabelProps();
    expect(comboboxProps).toEqual(
      {
        id: `v-${idPrefix}-vue-combo-blocks-label`,
        for: `v-${idPrefix}-vue-combo-blocks-input`,
      },
    );
  });
  it('returns getItemProps', () => {
    const wrapper = factory();
    const idPrefix = wrapper.vm.idCounter;

    const itemProps = wrapper.vm.getItemProps({ item: items[1] });

    expect(itemProps).toEqual(
      {
        id: `v-${idPrefix}-vue-combo-blocks-item-1`,
        role: 'option',
        disabled: undefined,
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
    wrapper.vm.onInputKeyUp = jest.fn();
    wrapper.vm.onInputKeyDown = jest.fn();

    wrapper.vm.getInputEventListeners().blur();
    wrapper.vm.getInputEventListeners().input();
    wrapper.vm.getInputEventListeners().keydown();
    wrapper.vm.getInputEventListeners().keyup();

    expect(wrapper.vm.onInputBlur).toHaveBeenCalled();
    expect(wrapper.vm.onInput).toHaveBeenCalled();
    expect(wrapper.vm.onInputKeyUp).toHaveBeenCalled();
    expect(wrapper.vm.onInputKeyDown).toHaveBeenCalled();
  });
  it('getMenuEventListeners call right methods', () => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;
    wrapper.vm.hovered = item;
    wrapper.vm.getMenuEventListeners({ item }).mouseleave();
    expect(wrapper.vm.hovered).toBeNull();
    expect(wrapper.vm.hoveredIndex).toBe(-1);
  });
  it('getItemEventListeners call right methods', () => {
    const fakeEvent = { preventDefault: () => {} };
    const wrapper = factory();
    wrapper.vm.inputValue = '';
    wrapper.vm.selectedItem = null;
    wrapper.vm.isOpen = true;
    wrapper.vm.hoveredIndex = 0;
    wrapper.vm.hovered = item;

    wrapper.vm.getItemEventListeners({ item }).mousemove(fakeEvent);
    expect(wrapper.vm.hovered).toEqual(item);

    wrapper.vm.getItemEventListeners({ item }).click(fakeEvent);
    expect(wrapper.vm.selectedItem).toEqual(item);
    expect(wrapper.vm.isOpen).toEqual(false);
    expect(wrapper.vm.hovered).toEqual(null);
    expect(wrapper.vm.hoveredIndex).toEqual(-1);
    expect(wrapper.vm.inputValue).toBe(item.name);
  });

  // helpers

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
    wrapper.vm.setInputValue(text);

    expect(wrapper.emitted()['input-value-change'][0]).toEqual([text, 'FunctionSetInputValue']);
  });
  it('clears the selection and emit change evt', () => {
    const wrapper = factory();

    wrapper.vm.selectedItem = item;

    wrapper.vm.reset();

    expect(wrapper.vm.selectedItem).toBeNull();
    expect(wrapper.vm.selectedIndex).toBe(-1);
    expect(wrapper.vm.inputValue).toBe('');
    expect(wrapper.emitted().change[0]).toEqual([null, 'FunctionReset']);
  });
  it('sets new selectedItem item', () => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;

    wrapper.vm.select(item);

    expect(wrapper.vm.selectedItem).toEqual(item);
    expect(wrapper.vm.inputValue).toEqual(item.name);
    expect(wrapper.emitted().change[0]).toEqual([item, 'FunctionSelectItem']);
  });
  it('selects same item again', (done) => {
    const wrapper = factory();
    wrapper.vm.hoveredIndex = 0;
    // wrapper.vm.setState = jest.fn();

    wrapper.vm.select(item, wrapper.vm.hoveredIndex);
    wrapper.vm.select(item, wrapper.vm.hoveredIndex);

    setTimeout(() => {
      // expect(wrapper.vm.setState).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.selectedItem).toEqual(item);
      expect(wrapper.emitted().change.length).toBe(1);
      expect(wrapper.emitted().select.length).toBe(2);
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

    wrapper.vm.openMenu();

    expect(wrapper.vm.isOpen).toBe(true);
  });
  it('hides list', () => {
    const wrapper = factory();
    wrapper.vm.isOpen = true;

    wrapper.vm.closeMenu();

    expect(wrapper.vm.isOpen).toBe(false);
  });
});
