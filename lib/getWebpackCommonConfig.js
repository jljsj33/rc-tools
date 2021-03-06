'use strict';

const path = require('path');
const resolveCwd = require('./resolveCwd');
const cwd = process.cwd();
const pkg = require(resolveCwd('package.json'));
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const getBabelCommonConfig = require('./getBabelCommonConfig');
const tsConfig = require('./getTSCommonConfig')();
const constants = require('./constants');
const assign = require('object-assign');

delete tsConfig.noExternalResolve;

tsConfig.declaration = false;

function getResolve() {
  const alias = {};
  const resolve = {
    modules: [cwd, 'node_modules'],
    extensions: ['.web.ts', '.web.tsx', '.web.js', '.web.jsx', '.ts', '.tsx', '.js', '.jsx'],
    alias,
  };
  const name = pkg.name;
  alias[`${name}$`] = resolveCwd('index.js');
  alias[`${name}/${constants.tsCompiledDir}`] = cwd;
  alias[name] = cwd;
  return resolve;
}


const postcssLoader = {
  loader: 'postcss',
  options: { plugins: require('./postcssConfig') },
};

module.exports = {
  getResolve,
  getResolveLoader() {
    return {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        // npm3 flat module
        path.resolve(__dirname, '../../'),
      ],
      moduleExtensions: ['-loader'],
    };
  },
  getLoaders(c) {
    const commonjs = c || false;
    const babelLoader = {
      loader: 'babel',
      options: getBabelCommonConfig(commonjs),
    };
    return [
      assign({
        test: /\.jsx?$/,
        exclude: /node_modules/,
      }, babelLoader),
      {
        test: /\.svg$/,
        loader: 'svg-sprite',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          babelLoader,
          {
            loader: 'ts',
            options: {
              transpileOnly: true,
              compilerOptions: tsConfig,
            },
          }],
      },
      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url',
        options: {
          limit: 10000,
          minetype: 'application/font-woff',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url',
        options: {
          limit: 10000,
          minetype: 'application/octet-stream',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file',
      },
      {
        test: /\.(png|jpg|jpeg|webp)$/i,
        loader: 'file',
      },
    ];
  },
  getCssLoaders(extractCss) {
    let cssLoader = [{
      loader: 'css',
      options: {
        importLoaders: 1,
        sourceMap: true,
      },
    }, postcssLoader];
    let lessLoader = cssLoader.concat([
      {
        loader: 'less',
        options: {
          sourceMap: true,
        },
      },
    ]);
    if (extractCss) {
      cssLoader = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: cssLoader,
      });
      lessLoader = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: lessLoader,
      });
    } else {
      const styleLoader = {
        loader: 'style',
      };
      cssLoader.unshift(styleLoader);
      lessLoader.unshift(styleLoader);
    }
    return [
      {
        test: /\.css$/,
        use: cssLoader,
      },
      {
        test: /\.less$/,
        use: lessLoader,
      },
    ];
  },
};
