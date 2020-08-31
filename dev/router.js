// eslint-disable-next-line import/no-extraneous-dependencies
import Router from 'vue-router';
import Vue from 'vue';
import AutoComplete from './components/AutoComplete.vue';
import SimpleAutoComplete from './components/SimpleAutoComplete.vue';
import MultiSelect from './components/MultiSelect.vue';

Vue.use(Router);
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
];

export default new Router({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { selector: to.hash };
    }
    return { x: 0, y: 0 };
  },
  mode: 'history',
});
