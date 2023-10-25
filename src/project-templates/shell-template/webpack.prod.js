const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const WebpackConcatPlugin = require('@mcler/webpack-concat-plugin');
const common = require('./webpack.common.js');
const pkg = require('./package.json');
const appConfig = require('./app.config');

const appName = appConfig.appName;
const appVersion = pkg.version;
const crLib = appConfig.crLib;
const webXPanel = appConfig.webXPanel;

const mainTemplateJs = appConfig.mainTemplateJs;
const componentsTemplateJs = appConfig.componentsTemplateJs;
const mainProjectJs = appConfig.mainProjectJs;
const componentsProjectJs = appConfig.componentsProjectJs;
const jsList = [...webXPanel, ...crLib];
const componentsList = [...mainTemplateJs, ...mainProjectJs, ...componentsTemplateJs, ...componentsProjectJs];

// app version
const appVersionInfo = {};
appVersionInfo.appName = appName;
appVersionInfo.appVersion = appVersion;

module.exports = merge(common("prod"), {
  mode: 'production',
  plugins: [
    new WebpackConcatPlugin({
      name: 'component',
      outputPath: './libraries/',
      fileName: '[name].[hash:8].js',
      filesToConcat: componentsList,
      attributes: {
        async: false,
        defer: false
      }
    }),
    new WebpackConcatPlugin({
      name: 'cr-com-lib',
      outputPath: './libraries/',
      fileName: '[name].[hash:8].js',
      filesToConcat: jsList,
      attributes: {
        async: false,
        defer: false
      }
    }),
    new GenerateJsonPlugin('assets/data/app.manifest.json', appVersionInfo),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './app/index.html',
      hash: true,
      inject: false
    })
  ]
});
