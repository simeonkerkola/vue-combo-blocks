console.log('env', process.env.NODE_ENV);

module.exports = {
  css: { extract: false },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
  },
};
