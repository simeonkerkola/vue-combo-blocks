<template>
  <div>
    <ul>
      <li v-for="route in routes" :key="route.path">
        <router-link :to="route.path">{{ route.path }}</router-link>
      </li>
    </ul>
    <router-view />
  </div>
</template>

<script>
import { routes } from "./router";

export default {
  data() {
    return { routes };
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
}
</style>
