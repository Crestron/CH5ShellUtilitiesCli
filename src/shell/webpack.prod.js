const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');
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
    new WebpackConcatPlugin({
      bundles: [
        {
          dest: './dist/prod/Shell/libraries/cr-com-lib.js',
          src: jsList,
        },
      ],
    }),
    new WebpackConcatPlugin({
      bundles: [
        {
          dest: './dist/prod/Shell/libraries/component.js',
          src: componentsList,
        },
      ],
    }),
    new GenerateJsonPlugin('assets/data/app.manifest.json', appVersionInfo),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: false,
      template: './app/index.html'
    })
  ]
});
