<template>
  <div id="app">
    <AutoComplete v-bind="props">
    </AutoComplete>

    <!-- <MultiSelect v-bind="props">
    </MultiSelect> -->

  </div>
</template>

<script>
import AutoComplete from '../tests/unit/components/AutoComplete.vue';
// import MultiSelect from '../tests/unit/components/MultiSelect.vue';

export default {
  name: 'App',
  components: {
    // MultiSelect,
    AutoComplete,
  },
  data() {
    const list = [
      { displayName: 'first', id: '123' },
      { displayName: 'second', id: '456' },
      { displayName: 'third', id: '789' },
      { displayName: 'duplicate', id: '789' },
      { displayName: 'duplicate', id: '789' },
    ];
    return {
      props: {
        list,
        value: list[0],

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
  padding-top: 60px;
  height: 100vh;
}
</style>
