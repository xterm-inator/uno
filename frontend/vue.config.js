let path = require('path')
let webpack = require('webpack')

const resolve = (dir) => {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: 'error',
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('common', resolve('common'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('assets', resolve('src/assets'))
      .set('utils', resolve('src/utils'))
      .set('vx', resolve('src/vuex'))
      .set('router', resolve('src/router'))
      .set('mixins', resolve('src/mixins'))
      .set('filters', resolve('src/filters'))
      .set('templates', resolve('src/templates'))
  },
  devServer: {
    historyApiFallback: true,
    port: '8080',
    disableHostCheck: true
  },
  css: {
    loaderOptions: {
      postcss: {
        path: resolve('postcss.config.js')
      }
    }
  }
}
