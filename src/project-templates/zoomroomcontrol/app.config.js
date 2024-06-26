/**
 * Any changes of the project variables below must be updated in package.json as well
 * appName: Scrips -> cleanjs, cleanjs:start, cleanjs:prod, build:archive
 * distPath (changed for dev): Scrips -> cleanjs:start, clean:start
 * distPath (changed for prod): Scrips -> cleanjs:prod, clean:prod, build:prod, build:archive, build:deploy
 * 
 * No changes should be made to other project variables.
 */
const path = require("path");
const { glob } = require('glob');

const appName = `Shell`;
const basePath = path.resolve(__dirname);
const nodeModules = `./node_modules/`;
const srcRoot = `./app`;
const srcTemplateRoot = `./app/template`;
const srcProjectRoot = `./app/project`;
const crLib = pathReWrite(glob.sync(`${nodeModules}/@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js`));
const webXPanel = pathReWrite(glob.sync(`${nodeModules}/@crestron/ch5-webxpanel/dist/umd/index.js`));
const mainTemplateJs = pathReWrite(glob.sync(`${srcTemplateRoot}/libraries/*.js`));
const mainProjectJs = pathReWrite(glob.sync(`${srcProjectRoot}/libraries/*.js`));
const componentsTemplateJs = pathReWrite(glob.sync(`${srcTemplateRoot}/components/**/*.js`));
const componentsProjectJs = pathReWrite(glob.sync(`${srcProjectRoot}/components/**/*.js`));
const themeBasePath = 'node_modules/@crestron/ch5-theme/output/themes/';
const zoomMngr = pathReWrite(glob.sync(`${nodeModules}/@crestron/ch5-zoom-lib/dist/index.js`));

function pathReWrite(data) {
  let tempArray = [];
  for (let i = 0; i < data.length; i++) {
    let updatedPath = data[i].toString().replaceAll('\\', '/');
    updatedPath = './' + updatedPath;
    tempArray.unshift(updatedPath);
  }
  return tempArray;
}

module.exports = {
  appName,
  basePath,
  componentsTemplateJs,
  crLib,
  componentsProjectJs,
  distPath: {
    dev: 'dist/dev/' + `${appName}`,
    prod: 'dist/prod/' + `${appName}`
  },
  mainProjectJs,
  mainTemplateJs,
  nodeModules,
  srcProjectRoot,
  srcRoot,
  srcTemplateRoot,
  webXPanel,
  themeBasePath,
  zoomMngr
};