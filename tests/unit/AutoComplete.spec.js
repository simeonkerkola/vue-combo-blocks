/* eslint no-underscore-dangle: ["error", { "allow": ["idCounter"] }] */
import { mount } from '@vue/test-utils';
import AutoComplete from '../../dev/components/AutoComplete.vue';

const list = [
  { displayName: 'first', id: '123' },
  { displayName: 'second', id: '456' },
  { displayName: 'third', id: '789' },
];
const factory = ({ propsData } = {}) => mount(AutoComplete,
  {
    propsData: {
      id: 'listId',
      list,
      displayAttribute: 'displayName',
      ...propsData,
    },
  });
describe('AutoComplete', () => {
  it('renders the list items', () => {
    const wrapper = factory();
    expect(wrapper.findAll('li').at(0).text()).toBe(list[0].displayName);
    expect(wrapper.findAll('li').at(1).text()).toBe(list[1].displayName);
    expect(wrapper.findAll('li').at(2).text()).toBe(list[2].displayName);
  });
  it('applies the list item props as html attributes', () => {
    const wrapper = factory();
    const VueComboBlocks = wrapper.findComponent({ name: 'VueComboBlocks' });
    const idPrefix = VueComboBlocks.vm.idCounter;

    const item0 = wrapper.findAll('li').at(0);
    const item1 = wrapper.findAll('li').at(1);
    const item2 = wrapper.findAll('li').at(2);

    expect(item0.attributes().id).toBe(`v-${idPrefix}-vue-combo-blocks-item-0`);
    expect(item1.attributes().id).toBe(`v-${idPrefix}-vue-combo-blocks-item-1`);
    expect(item2.attributes().id).toBe(`v-${idPrefix}-vue-combo-blocks-item-2`);

    expect(item0.attributes().role).toBe('option');
    expect(item1.attributes().role).toBe('option');
    expect(item2.attributes().role).toBe('option');

    expect(item0.attributes('aria-selected')).toBe('true');
    expect(item1.attributes('aria-selected')).toBe('false');
    expect(item2.attributes('aria-selected')).toBe('false');
  });

  it('applies the list props as html attributes', () => {
    const wrapper = factory();
    const VueComboBlocks = wrapper.findComponent({ name: 'VueComboBlocks' });
    const idPrefix = VueComboBlocks.vm.idCounter;

    const wrapperdList = wrapper.find('ul');

    expect(wrapperdList.attributes().id).toBe(`v-${idPrefix}-vue-combo-blocks-menu`);
    expect(wrapperdList.attributes().role).toBe('listbox');
    expect(wrapperdList.attributes('aria-labelledby')).toBe(`v-${idPrefix}-vue-combo-blocks-label`);
  });

  it('applies the input props as html attributes', () => {
    const wrapper = factory();
    const VueComboBlocks = wrapper.findComponent({ name: 'VueComboBlocks' });
    const idPrefix = VueComboBlocks.vm.idCounter;

    const input = wrapper.find('input');

    expect(input.attributes('aria-activedescendant')).toBe('');
    expect(input.attributes('aria-autocomplete')).toBe('list');
    expect(input.attributes('aria-controls')).toBe(`v-${idPrefix}-vue-combo-blocks-menu`);
  });

  it('applies the combobox props as html attributes', () => {
    const wrapper = factory();
    const VueComboBlocks = wrapper.findComponent({ name: 'VueComboBlocks' });
    const idPrefix = VueComboBlocks.vm.idCounter;

    const combobox = wrapper.find('#combobox');

    expect(combobox.attributes('role')).toBe('combobox');
    expect(combobox.attributes('aria-haspopup')).toBe('listbox');
    expect(combobox.attributes('aria-expanded')).toBe('false');
    expect(combobox.attributes('aria-owns')).toBe(`v-${idPrefix}-vue-combo-blocks-menu`);
  });
});
