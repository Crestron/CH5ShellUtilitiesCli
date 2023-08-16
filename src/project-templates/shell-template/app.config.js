/**
 * Any changes of the project variables below must be updated in package.json as well
 * appName: Scrips -> cleanjs, cleanjs:start, cleanjs:prod, build:archive
 * distPath (changed for dev): Scrips -> cleanjs:start, clean:start
 * distPath (changed for prod): Scrips -> cleanjs:prod, clean:prod, build:prod, build:archive, build:deploy
 * 
 * No changes should be made to other project variables.
 */
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const projectConfig = require("./app/project-config.json");

const appName = `Shell`;
const basePath = path.resolve(__dirname);
const nodeModules = `./node_modules/`;
const srcRoot = `./app`;
const srcTemplateRoot = `./app/template`;
const srcProjectRoot = `./app/project`;
const fontAwesomeCssBasePath = `${nodeModules}@fortawesome/fontawesome-free/css`;
const materialIconsCssBasePath = `${nodeModules}@material-icons/font/css`;
const sgCssBasePath = `${nodeModules}@crestron/ch5-theme/output/themes/sg-icons/css/all.css`;
const sgIconsBasePath = `${nodeModules}@crestron/ch5-theme/output/themes/sg-icons/svgs/icons`;
const sgMediaTransportAccent = `${nodeModules}@crestron/ch5-theme/output/themes/sg-icons/svgs/media-transports/accents`;
const sgMediaTransportDark = `${nodeModules}@crestron/ch5-theme/output/themes/sg-icons/svgs/media-transports/dark`;
const sgMediaTransportLight = `${nodeModules}@crestron/ch5-theme/output/themes/sg-icons/svgs/media-transports/light`;
const baseThemePath = `${nodeModules}@crestron/ch5-theme/output/themes/${getBaseTheme()}.css`;
const crLib = glob.sync(`${nodeModules}/@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js`);
const webXPanel = glob.sync(`${nodeModules}/@crestron/ch5-webxpanel/dist/umd/index.js`);
const mainTemplateJs = glob.sync(`${srcTemplateRoot}/libraries/*.js`);
const mainProjectJs = glob.sync(`${srcProjectRoot}/libraries/*.js`);
const componentsTemplateJs = glob.sync(`${srcTemplateRoot}/components/**/*.js`);
const componentsProjectJs = glob.sync(`${srcProjectRoot}/components/**/*.js`);

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
  fontAwesomeCssBasePath,
  materialIconsCssBasePath,
  mainProjectJs,
  mainTemplateJs,
  nodeModules,
  baseThemePath,
  srcProjectRoot,
  srcRoot,
  srcTemplateRoot,
  webXPanel,
  sgCssBasePath,
  sgIconsBasePath,
  sgMediaTransportAccent,
  sgMediaTransportDark,
  sgMediaTransportLight
};

function getBaseTheme() {
  const selectedTheme = projectConfig.selectedTheme.toString().toLowerCase();
  const selectedThemeObject = projectConfig.themes.find(theme => theme.name.toLowerCase() === selectedTheme);
  if (selectedThemeObject) {
    const themesPath = `${nodeModules}@crestron/ch5-theme/output/themes/`;
    const filesList = fs.readdirSync(themesPath);
    for (let i = 0; i < filesList.length; i++) {
      if (selectedThemeObject.extends + ".css" === filesList[i].toLowerCase()) {
        return selectedThemeObject.extends;
      }
    }
  }
  return 'light-theme';
}
