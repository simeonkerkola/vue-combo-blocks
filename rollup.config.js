import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
// Transpile/polyfill with reasonable browser support
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';

const name = 'VueComboBlocks';
const filePrefix = 'build/vue-combo-blocks';
export default {
  input: 'src/vue-combo-blocks.js', // Path relative to package.json

  output: [
    {
      file: `${filePrefix}.esm.js`,
      format: 'es',
      name,
      exports: 'named',
    },
    {
      file: `${filePrefix}.umd.js`,
      format: 'umd',
      name,
      exports: 'named',
    },
    {
      file: `${filePrefix}.min.js`,
      format: 'iife',
      name,
      plugins: [terser()],
      exports: 'named',
    }],
  plugins: [
    commonjs(),
    vue({
      css: false, // Dynamically inject css as a <style> tag
      compileTemplate: true, // Explicitly convert template to render function
    }),
    buble({ transforms: { templateString: true } }),
  ],
};
