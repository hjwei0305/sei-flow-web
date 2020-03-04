
export default (config) => {
  /** 为是的组件库中的css module生效 */
  config.module
  .rule('less-in-node_modules')
  .include
  .end()
  .use('css-loader')
  .loader('css-loader')
  .options({
    importLoaders: 1,
    sourceMap: true,
    modules: true,
    localIdentName: '[name]__[local]___[hash:base64:5]',
  });
};
