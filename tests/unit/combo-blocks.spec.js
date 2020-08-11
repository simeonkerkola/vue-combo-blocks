/* eslint no-underscore-dangle: ["error", { "allow": ["_uid"] }] */
import { mount } from '@vue/test-utils';
import main from '../../src/combo-blocks';

const factory = ({ propsData, scopedSlots, ...rest } = {}) => mount(main,

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

describe('main.js', () => {
  it('does render', () => {
    const wrapper = factory();
    expect(wrapper.vm).toBeDefined();
  });

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

    wrapper.vm.onListMouseEnter = jest.fn();
    wrapper.vm.onListMouseLeave = jest.fn();

    wrapper.vm.getListEventListeners().mouseenter();
    wrapper.vm.getListEventListeners().mouseleave();

    expect(wrapper.vm.onListMouseEnter).toHaveBeenCalled();
    expect(wrapper.vm.onListMouseLeave).toHaveBeenCalled();
  });
});
