/* eslint no-console: 0 */

'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

// [webpack-rails] must match config.webpack.dev_server.port
const appRoot = path.join(__dirname, 'app')
const devServerPort = 3808
let env = 'development'
if (process.env.NODE_ENV === 'production') {
  env = 'production'
}


const envFlagPlugin = new webpack.DefinePlugin({
  __ENV__: JSON.stringify(env),
  __DEV__: JSON.stringify(env === 'development'),
  __PROD__: JSON.stringify(env === 'production')
})

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  filename: 'index.html',
  template: 'index.html',
  appMountId: 'root',
  title: 'fivestar | Better Amazon Search',
  googleAnalytics: {
    trackingId: 'UA-49173715-1',
    pageViewOnLoad: false
  }
})

const configs = {

  common: {
    context: `${__dirname}/app`,
    entry: {
      index: './index.js'
    },
    resolve: {
      root: `${__dirname}/app`,
      extensions: ['', '.js', '.json', '.jsx'],
      alias: {
        actions: path.join(appRoot, 'actions'),
        components: path.join(appRoot, 'components'),
        containers: path.join(appRoot, 'containers'),
        middleware: path.join(appRoot, 'middleware'),
        reducers: path.join(appRoot, 'reducers'),
        images: path.join(appRoot, 'images'),
        styles: path.join(appRoot, 'styles')
      }
    },
    plugins: [
      envFlagPlugin,
      new ExtractTextPlugin('styles.css'),
      new FaviconsWebpackPlugin('images/logo.png'),
      htmlWebpackPlugin
    ],
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      }, {
        test: /\.(png|gif|jpe?g|svg)$/i,
        loader: 'url',
        query: {
          limit: 10000
        }
      }, {
        test: /\.(s?css)$/i,
        loader: ExtractTextPlugin.extract('style-loader', 'css!sass')
      }]
    }
  },

  development: {
    devServer: {
      port: devServerPort,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    devtool: 'inline-source-map',
    output: {
      path: path.join(__dirname, 'build'),
      // publicPath: '//localhost:${devServerPort}/client/',
      filename: '[name].js'
    }
  },

  production: {
    output: {
      path: path.join(__dirname, 'build'),
      // publicPath: '/',
      filename: '[name]-[chunkhash].js'
    },
    plugins: [
      envFlagPlugin,
      new ExtractTextPlugin('styles-[hash].css'),
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        },
        sourceMap: false
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      htmlWebpackPlugin
    ]
  }

}

console.log(`Started ${env} build...\n`)

const webpackConfig = Object.assign(configs.common, configs[env])

module.exports = webpackConfig
