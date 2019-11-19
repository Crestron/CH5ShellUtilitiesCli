<p align="center">
  <img src="https://kenticoprod.azureedge.net/kenticoblob/crestron/media/crestron/generalsiteimages/crestron-logo.png">
</p>
 
# CH5 Utilities - Getting Started

> Archiving and distribution utilities to be used by the applications implemented with the CH5 Components Library.

## Table of Contents

- [Background](#background)
- [Setup](#setup)
- [Commands](#commands)
- [Configuration](#configuration)
- [License](#license)

## Background

The purpose of the library is to satisfy three functions:

- archiving - create a package that can distributed manually or with the utility
- distribution - deploy a package built with the utility
- archive & distribute - single command for both of the above

The final result of the archiving will be a .ch5z package.
This contains two files:

- *.ch5 - the actual package
- *_manifest.json - a manifest file describing the .ch5 file ( project name, timestamp, hash and any other optional details)

## Setup

Install the required packages.
```
yarn install
```

Build the library.
```
yarn build
```

Publish the ch5-utilities library for local usage.
```
yarn link
```

## Commands

The commands is for development, debugging, and testing purposes only.

Before running, make sure that all the values are properly modified for local usage, in the `config` variable in `start.ts`.

#### yarn start

Running `yarn start` will run the **archive&deploy** functions based on the config in the `src/start.ts` file.

#### yarn start:archive

Running `yarn start:archive` will run the **archive** function based on the config in the `src/start.ts` file.

#### yarn start:distribute

Running `yarn start:distribute` will run the **distribute** function based on the config in the `src/start.ts` file.

#### yarn start:js

Same as `yarn start`, but will run the bundled JS version of the library ( the one in the ``build`` directory ).

#### yarn start:js:archive

Same as `yarn start:archive`, but will run the bundled JS version of the library ( the one in the ``build`` directory ).

#### yarn start:js:distribute

Same as `yarn start:distribute`, but will run the bundled JS version of the library ( the one in the ``build`` directory ).

#### yarn publish:local

After the initial setup, you can use this command to rebuild and publish changes in the library.

## Configuration

The  methods `archiver` and `distributor` from `src/index.ts` expect a to get a configuration of type `IConfigOptions`.

Below we describe each property, their purpose and possible values.

#### projectName 

Required.

The name of the project will set the package name and the manifest details for the project.
It should be set according to the delivered package.

Default value is ``crestron-system``.

#### directoryName

Required.

This is the path to the directory that contains the deliverables.

Currently this is the showcase-app dist directory.

The path can be absolute or should be relative to the location from which the command is run in the CLI.

#### outputDirectory

Required.

This is the path where the package files will be copied to.

The path can be absolute or should be relative to the location from which the command is run in the CLI.

#### outputLevel

Optional

This sets the level of CLI logging that is required.

Possible values are: ``quiet | normal | verbose``.

#### additionalAppuiManifestParameters

Optional.

This is a key-value collection that can be used to set extra details in the app ( in this case showcase-app ) manifest JSON file.

#### additionalProjectManifestParameters

Optional.

This is a key-value collection that can be used to set extra details in the project manifest JSON file. 

#### controlSystemHost

Required.

This should be the hostname or IP address of the device where the package will be deployed.

#### promptForCredential

This will always be set to true, since the utility will always prompt for the credentials in the CLI.

#### sftpDirectory

Required.

This is the target directory on the ``controlSystemHost``.

It must be relative to the SFTP root directory.

It will be ``display`` for the showcase-app, or ``HTML`` for CCS.

#### deviceType

Required.

This should be set based on the ``controlSystemHost``, depending on what kind of device you are targeting for the deploy.

Possible values are: ``touchscreen | controlsystem | web``.

#### contractFile

Optional

Relative or absolute file path for contract editor config file.File must have .cse2j extension.

## License

Copyright (C) 2018 to the present, Crestron Electronics, Inc.
All rights reserved.
No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.
Use of this source code is subject to the terms of the Crestron Software 
Development Tools License Agreement under which you licensed this source code.

If you did not accept the terms of the license agreement,
you are not authorized to use this software. For the terms of the license,
please see the license agreement between you and Crestron at http://www.crestron.com/sla.
