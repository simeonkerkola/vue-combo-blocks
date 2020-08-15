<template>
  <div id="app">
    <AutoComplete v-bind="props">

    </AutoComplete>
  </div>
</template>

<script>
import AutoComplete from '../tests/unit/components/AutoComplete.vue';

export default {
  name: 'App',
  components: {
    AutoComplete,
  },
  data() {
    const list = [
      { displayName: 'first', id: '123' },
      { displayName: 'first', id: '123' },
      { displayName: 'first', id: '123' },
      { displayName: 'second', id: '456' },
      { displayName: 'third', id: '789' },
    ];
    return {
      props: {
        list,
        value: list[1],

        id: 'listId',
        displayAttribute: 'displayName',
      },
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
