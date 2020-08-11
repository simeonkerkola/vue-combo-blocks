import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import babel from '@rollup/plugin-babel';
// Transpile/polyfill with reasonable browser support
export default {
  input: 'src/combo-blocks.js', // Path relative to package.json
  output: {
    name: 'MyComponent',
    exports: 'named',
  },
  plugins: [
    commonjs(),
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true, // Explicitly convert template to render function
    }),
    babel({ babelHelpers: 'runtime' }),
  ],
};
