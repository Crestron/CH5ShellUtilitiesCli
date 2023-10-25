/**
 * copy css unminified files into destination folder
 */

const merge = require('webpack-merge');
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
const zoomMngr = appConfig.zoomMngr;
const jsList = [...webXPanel, ...crLib];
const mainTemplateJs = appConfig.mainTemplateJs;
const componentsTemplateJs = appConfig.componentsTemplateJs;
const mainProjectJs = appConfig.mainProjectJs;
const componentsProjectJs = appConfig.componentsProjectJs;
const componentsList = [...mainTemplateJs, ...mainProjectJs, ...componentsTemplateJs, ...componentsProjectJs];
const zoomMngrList = [...zoomMngr];

// app version
const appVersionInfo = {};
appVersionInfo.appName = appName;
appVersionInfo.appVersion = appVersion;

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
    new WebpackConcatPlugin({
      name: 'ch5-zoom-lib',
      outputPath: './libraries/',
      fileName: '[name].[hash:8].js',
      filesToConcat: zoomMngrList,
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
