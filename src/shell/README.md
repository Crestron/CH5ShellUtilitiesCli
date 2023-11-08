# Shell Template

The shell template uses CH5 library and Vanilla Javascript which helps to kick-start your project to build fast, robust, and adaptable web apps with little changes. The project can be deployed on TSW Panels, Android and iOS devices.
 
## See www.crestron.com/developer for documentation

https://www.crestron.com/developer

# Shell Template

The project have dependencies that require nodejs(https://nodejs.org), together with NPM.

# Installation

## Install all global dependencies

Run `npm install -g @crestron/ch5-utilities-cli` to deploy the project on device.

## Install all local dependencies

Run `npm run install` to install all dependencies for the project.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

# How to deploy the project in TSW device

Need to add the hostname or IP address of TSW device in package.json, like below code
`"build:deploy": "ch5-cli deploy -H hostname -t touchscreen dist/shell-template-project.ch5z"`

## Production build

Run `npm run build:prod` to build the project in production mode. The build artifacts will be stored in the `dist/` directory.

## Create archive

Run `npm run build:archive` to create .ch5z file which supports TSW device. The build artifacts will be stored in the `dist/` directory.

## Deploy the project in TSW device

Run `npm run build:deploy` to deploy the project in TSW device.

## Deploy the project in one step

Run `npm run build:onestep` to build, archive and deploy the project in one step.

## Template Theme

To change the template theme from join, the join name can be configured on app/project-config.json using the receiveStateTheme and sendEventTheme properties in customSignals.
Initially the join for sendEvent and receiveState have been set to `templateTheme`.