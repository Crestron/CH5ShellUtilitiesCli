const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteJsonPlugin = require('write-json-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const common = require('./webpack.common.js');
const pkg = require('./package.json');
const appConfig = require('./app.config');
const projectConfig = require("./app/project-config.json");

const appName = appConfig.appName;
const appVersion = pkg.version;
const crLib = appConfig.crLib;
const webXPanel = appConfig.webXPanel;

const mainTemplateJs = appConfig.mainTemplateJs;
const componentsTemplateJs = appConfig.componentsTemplateJs;
const mainProjectJs = appConfig.mainProjectJs;
const componentsProjectJs = appConfig.componentsProjectJs;
const jsList = projectConfig.useWebXPanel ? [...webXPanel, ...crLib] : [...crLib];
const componentsList = [...mainTemplateJs, ...mainProjectJs,  ...componentsTemplateJs, ...componentsProjectJs];

// app version
const appVersionInfo = {};
appVersionInfo.appName = appName;
appVersionInfo.appVersion = appVersion;

module.exports = merge(common("prod"), {
  mode: 'production',
  plugins: [
    new ConcatPlugin({
      uglify: true,
      sourceMap: false,
      name: 'result',
      outputPath: 'libraries/',
      fileName: 'cr-com-lib.js',
      filesToConcat: jsList,
      attributes: {
        async: true
      }
    }),
    new ConcatPlugin({
      uglify: true,
      sourceMap: false,
      name: 'result',
      outputPath: 'libraries/',
      fileName: 'component.js',
      filesToConcat: componentsList,
      attributes: {
        async: true
      }
    }),
    new WriteJsonPlugin({
      object: appVersionInfo,
      path: 'assets/data/',
      filename: 'app.manifest.json',
      flatten: true,
      pretty: true
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: false,
      template: './app/index.html'
    })
  ]
});
