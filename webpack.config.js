/* eslint no-console: 0 */

'use strict'

const path = require('path')
const webpack = require('webpack')
const StatsPlugin = require('stats-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');


// [webpack-rails] must match config.webpack.dev_server.port
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

// [webpack-rails] must match config.webpack.manifest_filename
const statsPlugin = new StatsPlugin('bundle-manifest.json', {
  // We only need assetsByChunkName
  chunkModules: false,
  source: false,
  chunks: false,
  modules: false,
  assets: true
})


const configs = {

  common: {
    context: `${__dirname}/app`,
    entry: {
      index: './index.js'
    },
    resolve: {
      root: `${__dirname}/app`,
      extensions: ['', '.js', '.json', '.jsx']
    },
    plugins: [
      envFlagPlugin,
      new HtmlWebpackPlugin({
        template: 'index.hbs'
      })
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
        test: /\.hbs$/,
        loader: 'handlebars'
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
    devtool: 'cheap-module-eval-source-map',
    output: {
      path: path.join(__dirname, 'build'),
      // publicPath: `//localhost:${devServerPort}/client/`,
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
      new HtmlWebpackPlugin({
        template: 'index.hbs'
      }),
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
      new webpack.optimize.OccurenceOrderPlugin()
    ]
  }

}

console.log(`Started ${env} build...\n`)

module.exports = Object.assign(configs.common, configs[env])
