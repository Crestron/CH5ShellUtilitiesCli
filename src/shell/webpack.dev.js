/**
 * copy css unminified files into destination folder
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteJsonPlugin = require('write-json-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const common = require('./webpack.common.js');
const pkg = require('./package.json');
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const appConfig = require('./app.config');
const projectConfig = require("./app/project-config.json");

const appName = appConfig.appName;
const appVersion = pkg.version;
const distPath = appConfig.distPath.dev;
const crLib = appConfig.crLib;
const webXPanel = appConfig.webXPanel;
const jsList = projectConfig.useWebXPanel ? [...webXPanel, ...crLib] : [...crLib];
const mainTemplateJs = appConfig.mainTemplateJs;
const componentsTemplateJs = appConfig.componentsTemplateJs;
const mainProjectJs = appConfig.mainProjectJs;
const componentsProjectJs = appConfig.componentsProjectJs;
const componentsList = [...mainTemplateJs, ...mainProjectJs, ...componentsTemplateJs, ...componentsProjectJs];

// app version
const appVersionInfo = {};
appVersionInfo.appName = appName;
appVersionInfo.appVersion = appVersion;

module.exports = merge(common("dev"), {
  mode: "development",
  watch: true,
  plugins: [
    new ConcatPlugin({
      uglify: false,
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
      uglify: false,
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
    }),
    new BrowserSyncPlugin({
      host: "localhost",
      port: 3000,
      //files under watch
      files: ["./" + distPath + "/**/**/*.html", "./" + distPath + "/**/**/**/*.js", "./" + distPath + "/**/**/**/*.css", {
        match: ["./app/project-config.json"], fn: function (event, file) {
          const reset = "\x1b[0m";
          const fgMagenta = "\x1b[35m";
          console.warn(`${fgMagenta}[npm run start / yarn start] Detected ${event} to ${file}.  Please Restart.${reset}`);
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

function copyright() {
  return "Copyright (C) " + ((new Date()).getFullYear()) + " to the present, Crestron Electronics, Inc.\n" +
    "All rights reserved.\n" +
    "No part of this software may be reproduced in any form, machine\n" +
    "or natural, without the express written consent of Crestron Electronics.\n" +
    "Use of this source code is subject to the terms of the Crestron Software License Agreement\n" +
    "under which you licensed this source code.";
}