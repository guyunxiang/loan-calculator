const path = require('path');

// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  hash: true,
  history: 'hash',
  outputPath: 'docs',
  base: '/',
  publicPath: '/loan-calculator/',

  alias: {
    '@assets': path.resolve(__dirname, './src/assets'),
    '@components': path.resolve(__dirname, './src/components'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@services': path.resolve(__dirname, './src/services'),
  },

  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'loan-calculator',
      dll: false,

      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
}
