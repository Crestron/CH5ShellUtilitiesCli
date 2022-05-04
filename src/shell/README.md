# Shell Template

The shell template uses CH5 library and Vanilla javascript which helps to kick-start your project to build fast, robust, and adaptable web apps with little changes. The project can be deployed on TSW Panels, Android and iOS devices.
 
## See www.crestron.com/developer for documentation

https://www.crestron.com/developer

# Shell Template

The project have dependencies that require nodejs(https://nodejs.org), together with YARN(https://yarnpkg.com) or NPM.

# Installation

## Install all global dependencies

Run `yarn global add @crestron/ch5-utilities-cli` or `npm install -g @crestron/ch5-utilities-cli` to deploy the project on device.

## Install all local dependencies

Run `yarn install` to install all dependencies for the project.

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory.

# How to deploy the project in TSW device

Need to add the hostname or IP address of TSW device in package.json, like below code
`"build:deploy": "ch5-cli deploy -H hostname -t touchscreen dist/shell-template-project.ch5z"`

## Production build

Run `yarn build:prod` to build the project in production mode. The build artifacts will be stored in the `dist/` directory.

## Create archive

Run `yarn build:archive` to create .ch5z file which supports TSW device. The build artifacts will be stored in the `dist/` directory.

## Deploy the project in TSW device

Run `yarn build:deploy` to deploy the project in TSW device.

## Deploy the project in one step

Run `yarn build:onestep` to build, archive and deploy the project in one step.
