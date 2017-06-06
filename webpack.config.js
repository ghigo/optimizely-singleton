const webpack = require('webpack')

module.exports = {
  entry: {
    'optimizely-singleton.min': './index.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: 'babel-loader',
      options: {
        presets: ['es2015']
      }
    }]
  },
  output: {
    filename: './dist/[name].js',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}
