# Shell Template - Import All

The 'Import All' function imports assets, libraries, components to the './app/project/' folder using command line statements.
 
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
    yarn import:all [options]
    npm run import:all [options]

Options:
    -h, --help,         Help for Importing assets, libraries, components from the './app/project/' folder
    -z, --zipFile,      Prefix for full location path of the zip file to be imported
    -l, --list,         Prefix for list of file names
    -f, --force         Force the program to overwrite the target files with the source files and avoid any confirmation
    --all,              Select this option to import all the files

```

Yarn or NPM can be used to import the project assets, libraries, components. There are two options available:

1. Import the complete contents of the zip file to './app/project/' folder. To achieve this, use the following commands:

    yarn import:all -z {path} --all 

    npm run import:all -- -z {path} --all 

2. Import selected assets, libraries, components from './app/project/' folder. In this case, the filenames are mandatory in the command prompt. The filename must follow the complete path starting from './app/project/....'. Only filenames can be provided here (no folder paths). Multiple filenames can be provided in the command prompt. To achieve this, use the following commands:

    yarn import:all -z ./dist/exported-all.zip -l ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss

    npm run import:all -- -z ./dist/exported-all.zip -l ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss

    yarn import:all -z ./dist/exported-all.zip --list ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss

    npm run import:all -- -z ./dist/exported-all.zip --list ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss

To access help, execute `yarn import:all --help` or `npm run import:all -- --help`.


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

Parameters for "import:all" are as follows:
- "requiredFolderPath": "./app/project/" - This indicates the folder path of the project asset files.
- "templatesPath": "./shell-utilities/import-all/templates/" - This indicates the path where  the shell-utilities templates can be found.
- "outputFileName": "imported-all.zip" - This indicates the output zip file name.
- "outputTempFolderName": "Imported-All-Code-Folder-Temp" - This indicates the temporary path created for copying output files.
- "zipFolderName": "imported-all", - This is the name of the folder inside outputTempFolderName where the zip file will be created.
- "zipFileDestinationPath": "./dist/", - This is the path where the zip file will be created. Ensure that it starts with './' and ends with '/'.
- "exportedFolderName": Indicates the name of the folder that was used for exporting the zip file during export:all process.

### Copyright
Copyright (C) 2020 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement 
under which you licensed this source code. 