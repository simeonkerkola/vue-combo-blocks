console.log('env', process.env.NODE_ENV);

module.exports = {
  pages: {
    index: {
      // entry for the page
      entry: 'dev/main.js',
    },
  },
  css: { extract: false },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
};
