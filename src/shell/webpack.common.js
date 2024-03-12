const path = require("path");
const fs = require("fs");
const glob = require("glob");

const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CreateFileWebpack = require('create-file-webpack');
const appConfig = require("./app.config");
const appConfigDistPath = appConfig.distPath;
const basePath = appConfig.basePath;
const srcRoot = appConfig.srcRoot;
const srcTemplateRoot = appConfig.srcTemplateRoot;
const srcProjectRoot = appConfig.srcProjectRoot;

function getConfig(envPath) {
  let copyToDest = [];
  const distPath = appConfigDistPath[envPath];

  let fromCommonList = {
    fav: {
      to: `${distPath}`,
      from: `${srcRoot}/*.ico`,
    },
    projectConfig: {
      to: `${distPath}/assets/data`,
      from: `${srcRoot}/project-config.json`,
      context: "app/assets/data"
    },
    hardButtons: {
      to: `${distPath}/assets/data`,
      from: `${srcRoot}/hard-buttons.json`,
      context: "app/assets/data"
    },
    webXPanelContract: {
      to: `${distPath}/config/`,
      from: `./config/*.cse2j`
    }
  };

  let templateList = {
    component: {
      to: `${distPath}/app/components`,
      from: `${srcTemplateRoot}/components/**/*.html`,
      context: "app/components",
    },
    emulator: {
      to: `${distPath}/app/assets/data`,
      from: `${srcTemplateRoot}/components/**/*.json`,
      context: "app/assets/data",
    },
    fonts: {
      to: `${distPath}/app/assets/fonts`,
      from: `${srcTemplateRoot}/assets/fonts/**/*`,
      context: "app/assets/fonts",
    },
    images: {
      to: `${distPath}/app/assets/img`,
      from: `${srcTemplateRoot}/assets/img/**/*`,
      context: "app/assets/img",
    },
    json: {
      to: `${distPath}/app/assets/data`,
      from: `${srcTemplateRoot}/assets/data/**/*.json`,
      context: "app/assets/data",
    }
  };

  let projectList = {
    component: {
      to: `${distPath}/app/components`,
      from: `${srcProjectRoot}/components/**/*.html`,
      context: "app/components",
    },
    emulator: {
      to: `${distPath}/app/assets/data`,
      from: `${srcProjectRoot}/components/**/*.json`,
      context: "app/assets/data",
    },
    fonts: {
      to: `${distPath}/app/assets/fonts`,
      from: `${srcProjectRoot}/assets/fonts/**/*`,
      context: "app/assets/fonts",
    },
    images: {
      to: `${distPath}/app/assets/img`,
      from: `${srcProjectRoot}/assets/img/**/*`,
      context: "app/assets/img",
    },
    json: {
      to: `${distPath}/app/assets/data`,
      from: `${srcProjectRoot}/assets/data/**/*.json`,
      context: "app/assets/data",
    }
  };

  Object.keys(fromCommonList).forEach((key) => {
    let listObj = {};
    listObj.from = path.resolve(basePath, fromCommonList[key].from);
    listObj.to = path.resolve(basePath, fromCommonList[key].to);
    listObj.force = true;
    if (fromCommonList[key].context) {
      listObj.flatten = false;
      listObj.context = fromCommonList[key].context;
    } else {
      listObj.flatten = true;
    }
    copyToDest.push(listObj);
  });

  Object.keys(templateList).forEach((key) => {
    let listObj = {};
    listObj.from = path.resolve(basePath, templateList[key].from);
    listObj.to = path.resolve(basePath, templateList[key].to);
    listObj.force = true;
    if (templateList[key].context) {
      listObj.flatten = false;
      listObj.context = templateList[key].context;
    } else {
      listObj.flatten = true;
    }
    copyToDest.push(listObj);
  });

  Object.keys(projectList).forEach((key) => {
    let listObj = {};
    listObj.from = path.resolve(basePath, projectList[key].from);
    listObj.to = path.resolve(basePath, projectList[key].to);
    listObj.force = true;
    if (projectList[key].context) {
      listObj.flatten = false;
      listObj.context = projectList[key].context;
    } else {
      listObj.flatten = true;
    }
    copyToDest.push(listObj);
  });

  const ch5Theme = {
    from: path.resolve(path.resolve(__dirname), appConfig.themeBasePath),
    to: path.resolve(`${distPath}/assets/`),
  }

  copyToDest.push(ch5Theme)

  return copyToDest;
}

module.exports = (env) => {
  return {
    entry: {
      main: path.resolve(basePath, `${srcTemplateRoot}/assets/scss/main.scss`),
      templatecomponents: glob.sync(`${srcTemplateRoot}/components/**/*.scss`),
      projectcomponents: glob.sync(`${srcProjectRoot}/components/**/*.scss`),
    },
    output: {
      filename: "[name].[contenthash].js",
      path: path.resolve(basePath, appConfigDistPath[env]),
    },
    resolve: {
      extensions: [".scss", ".sass", ".css", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
          },
            "css-loader",
          ]
        },
        {
          test: /\.(png|jpg|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: './app/template/assets/img/[name][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          type: 'asset/resource',
          generator: {
            filename: './assets/font/[name][ext]', // material icons font
          },
        },
        {
          test: /fa-/,
          type: 'asset/resource',
          generator: {
            filename: './assets/webfonts/[name][ext]', // font awesome webfonts
          },
        },
        {
          test: /roboto-/,
          type: 'asset/resource',
          generator: {
            filename: './assets/webfonts/[name][ext]', // roboto webfonts
          },
        },
        {
          test: /\.scss$/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
          },
            "css-loader",
            "sass-loader",
          ]
        }
      ]
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
      new MiniCssExtractPlugin({
        filename: "assets/css/[name].[contenthash].css",
      }),
      new CopyPlugin(getConfig(env)),
      new CreateFileWebpack({
        path: './',
        fileName: 'copyright.txt',
        content: copyright()
      }),
      new CreateFileWebpack({
        path: `${appConfigDistPath[env]}/assets/data`,
        fileName: 'version.json',
        content: getVersionForPackages()
      })
    ],
    performance: {
      maxAssetSize: 5120000,
      maxEntrypointSize: 512000
    }
  }
};

function getVersionForPackages() {
  const crestronDependencies = [];
  const crestronNodeModulesPath = './node_modules/@crestron/'
  const fileNames = fs.readdirSync(crestronNodeModulesPath)
  for (const fileName of fileNames) {
    const folderStat = fs.statSync(crestronNodeModulesPath + fileName);
    const packageJsonFile = fs.readFileSync(crestronNodeModulesPath + fileName + '/package.json', 'utf-8');
    crestronDependencies.push(getDependencyEntry(fileName, packageJsonFile, folderStat))
  }

  // Include the shell template
  const shellProjectStat = fs.statSync(__dirname);
  const packageJsonFile = fs.readFileSync('./package.json', 'utf-8');
  crestronDependencies.push(getDependencyEntry('ch5 shell template project', packageJsonFile, shellProjectStat));

  return JSON.stringify(crestronDependencies);
}

function getDependencyEntry(name, package, folderStat) {
  return {
    name,
    version: JSON.parse(package).version,
    // lastModifiedDate: folderStat.ctime.getDate() + '-' + folderStat.ctime.toLocaleDateString('en-US', { month: 'short' }) + '-' + folderStat.ctime.getFullYear()
  }
}

function copyright() {
  return "Copyright (C) " + ((new Date()).getFullYear()) + " to the present, Crestron Electronics, Inc.\n" +
    "All rights reserved.\n" +
    "No part of this software may be reproduced in any form, machine\n" +
    "or natural, without the express written consent of Crestron Electronics.\n" +
    "Use of this source code is subject to the terms of the Crestron Software License Agreement\n" +
    "under which you licensed this source code.\n";
}