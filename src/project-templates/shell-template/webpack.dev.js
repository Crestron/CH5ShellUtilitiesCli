/**
 * copy css unminified files into destination folder
 */

const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const WebpackConcatPlugin = require('@mcler/webpack-concat-plugin');
const common = require('./webpack.common.js');
const pkg = require('./package.json');
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const appConfig = require('./app.config');

const appName = appConfig.appName;
const appVersion = pkg.version;
const distPath = appConfig.distPath.dev;
const crLib = appConfig.crLib;
const webXPanel = appConfig.webXPanel;
const jsList = [...webXPanel, ...crLib];
const mainTemplateJs = appConfig.mainTemplateJs;
const componentsTemplateJs = appConfig.componentsTemplateJs;
const mainProjectJs = appConfig.mainProjectJs;
const componentsProjectJs = appConfig.componentsProjectJs;
const componentsList = [...mainTemplateJs, ...mainProjectJs, ...componentsTemplateJs, ...componentsProjectJs];

// app version
const appVersionInfo = {};
appVersionInfo.appName = appName;
appVersionInfo.appVersion = appVersion;
appVersionInfo.ch5 = {};
appVersionInfo.ch5.crComLib = {};
appVersionInfo.ch5.crComLib.value = pkg.dependencies['@crestron/ch5-crcomlib'];
appVersionInfo.ch5.crComLib.version = getVersionValue(pkg.dependencies['@crestron/ch5-crcomlib']);
appVersionInfo.ch5.ch5Theme = {};
appVersionInfo.ch5.ch5Theme.value = pkg.dependencies['@crestron/ch5-theme'];
appVersionInfo.ch5.ch5Theme.version = getVersionValue(pkg.dependencies['@crestron/ch5-theme']);
appVersionInfo.ch5.ch5WebXPanel = {};
appVersionInfo.ch5.ch5WebXPanel.value = pkg.dependencies['@crestron/ch5-webxpanel'];
appVersionInfo.ch5.ch5WebXPanel.version = getVersionValue(pkg.dependencies['@crestron/ch5-webxpanel']);

function getVersionValue(input) {
  try {
    let output = input.toLowerCase().replaceAll("~", "").replaceAll("^", "").replaceAll(".tgz", "").replaceAll("file::", "");
    const urlStringForward = output.split("/");
    if (urlStringForward.length > 1) {
      output = urlStringForward[urlStringForward.length - 2];
    } else {
      output = urlStringForward[urlStringForward.length - 1];
    }
    const urlStringBackward = output.split("\\");
    if (urlStringBackward.length > 1) {
      output = urlStringBackward[urlStringBackward.length - 2];
    } else {
      output = urlStringBackward[urlStringBackward.length - 1];
    }
    return output;
  } catch {
    return input.toLowerCase().replaceAll("~", "").replaceAll("^", "").replaceAll(".tgz", "").replaceAll("file::", "");
  }
}

module.exports = merge(common("dev"), {
  mode: "development",
  watch: true,
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
    }),
    new BrowserSyncPlugin({
      host: "localhost",
      port: 3000,
      //files under watch
      files: ["./" + distPath + "/**/**/*.html", "./" + distPath + "/**/**/**/*.js", "./" + distPath + "/**/**/**/*.css", {
        match: ["./app/project-config.json"], fn: function (event, file) {
          const reset = "\x1b[0m";
          const fgMagenta = "\x1b[35m";
          console.warn(`${fgMagenta}[npm run start] Detected ${event} to ${file}.  Please Restart.${reset}`);
          process.exit(0);
        }
      }
      ],
      server: {
        baseDir: [distPath]
      },
      ghostMode: false
    })
  ]
});
