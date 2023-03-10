import {
  createRouter,
  createWebHistory,
  // eslint-disable-next-line import/no-extraneous-dependencies
} from 'vue-router';
import AutoComplete from './components/AutoComplete.vue';
import SimpleAutoComplete from './components/SimpleAutoComplete.vue';
import MultiSelect from './components/MultiSelect.vue';
import AutoScrollingList from './components/AutoScrollingList.vue';
import DisabledItems from './components/DisabledItems.vue';
import ControlledProp from './components/ControlledProp.vue';

export const routes = [
  {
    path: '/',
    component: AutoComplete,
  },
  {
    path: '/simple',
    component: SimpleAutoComplete,
  },
  {
    path: '/multiselect',
    component: MultiSelect,
  },
  {
    path: '/autoscrolling',
    component: AutoScrollingList,
  },
  {
    path: '/disableditems',
    component: DisabledItems,
  },
  {
    path: '/controlledprop',
    component: ControlledProp,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});
