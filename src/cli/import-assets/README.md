# Shell Template - Import Assets

The 'Import Assets' function imports assets to the './app/project/assets/' folder using command line statements.
 
## Installation

### Install Dependencies

*npm i rimraf --save-dev*

*npm i fs-extra --save-dev*

*npm i zip-lib --save-dev*

*npm i config --save-dev*

*npm i find-remove --save-dev*

## How to Use

```
Usage: 
    yarn import:assets [options]
    npm run import:assets [options]

You could use shortcuts as the following:
    yarn imp:a
    npm run imp:a

Options:
    -h, --help,         Help for Importing assets from the './app/project/assets/' folder
    -z, --zipFile,      Prefix for full location path of the zip file to be imported
    -l, --list,         Prefix for list of file names
    -f, --force         Force the program to overwrite the target files with the source files and avoid any confirmation
    --all,              Select this option to import all the files

```

Yarn or NPM can be used to import the project assets. There are two options available to import assets:

1. Import the complete contents of the zip file to './app/project/assets/' folder. To achieve this, use the below commands:

    yarn import:assets -z {path} --all 

    npm run import:assets -- -z {path} --all 

    yarn imp:a -z {path} --all 

    npm run imp:a -- -z {path} --all 

2. Import selected assets from './app/project/assets/' folder. In this case, the filenames are mandatory in the command-prompt. The filename must follow the complete path starting from './app/project/assets/....'. Only file names can be provided here (no folder paths). Multiple file names can be provided in the command prompt. To achieve this, use the following commands:

    yarn import:assets -z ./dist/exported-assets.zip -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

    npm run import:assets -- -z ./dist/exported-assets.zip -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

    yarn import:assets -z ./dist/exported-assets.zip --list ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

    npm run import:assets -- -z ./dist/exported-assets.zip --list ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

    yarn imp:a -z ./dist/exported-assets.zip -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

    npm run imp:a -- -z ./dist/exported-assets.zip -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

To access help, execute `yarn import:assets --help` or `npm run import:assets -- --help`.


### Use Tab Completion Feature

#### Tab Completion on Windows OS
The Windows command prompt does not allow you to use tab completion for commands and their options. However, it does support tab completion for folder and file names.

For example, open a command prompt, type cd D, and press Tab.  Since the user folder is selected by default, tab completion will automatically fill in cd Desktop, so pressing Enter will change directories to het desktop directory. This also helps when trying to run a command on a specific file name.

Tab completion also works in PowerShell. It can be used to automatically fill in the name of a file path.

Unlike in the bash shell, Windows requires Tab to be pressed multiple times to cycle through available options — it will not show them all in a list. This applies to both the command prompt and PowerShell’s tab completion features.

#### Tab Completion on Linux OS
Tab completion is especially useful when typing file names, directories, and paths. Rather than trying to type a long filename that may involve spaces and special characters, start typing the beginning of the name and press Tab.

For example, if you have a complex file name beginning with the letter L, type L and press Tab to automatically complete it. If you have multiple file names beginning with L, type additional letters for the filename before pressing Tab again.

#### Tab Completion on Mac OS
Mac OS X also includes the bash shell, so tab completion works just like it does on Linux. Tap the Tab key while typing a command, file path, or option—the shell automatically fills in the rest or shows the available options.

Any other operating system that uses the bash shell will work the same. Tab completion features should also work similarly on many other shells on Unix-like systems.

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at './shell-utilities/config/'.

Parameters for "import:assets" are as follows:
- "requiredFolderPath": "./app/project/assets/" - This indicates the folder path of the project asset files.
- "templatesPath": "./shell-utilities/import-assets/templates/" - This indicates the path where  the shell-utilities templates can be found.
- "outputFileName": "imported-assets.zip" - This indicates the output zip file name.
- "outputTempFolderName": "Imported-Assets-Code-Folder-Temp" - This indicates the temporary path created for copying output files.
- "zipFolderName": "imported-assets", - This is the name of the folder inside outputTempFolderName where the zip file will be created.
- "zipFileDestinationPath": "./dist/", - This is the path where the zip file will be created. Ensure that it starts with './' and ends with '/'.
- "exportedFolderName": Indicates the name of the folder that was used for exporting the zip file during export:assets process.

### Copyright
Copyright (C) 2020 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement 
under which you licensed this source code. 