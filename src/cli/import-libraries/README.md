# Shell Template - Import Libraries

The 'Import Libraries' function imports libraries to the './app/project/libraries/' folder using command line statements.

## How to Use

To import library, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli import:library`.
The package.json has scripts to handle this execution - for yarn, use `yarn import:library` command or npm  `npm run import:library` command. The short hand for it is `yarn imp:l` or `npm run imp:l` within scripts of package.json.

To access help, execute `ch5-shell-cli import:library --help` or `yarn import:library --help` or `npm run import:library –- --help`.

```bash
Usage:
    ch5-shell-cli import:components [options]
    
You could also use `yarn` or `npm run` to import components. The following are the commands:
    yarn import:library [options]
    npm run import:library [options]

Options:
    -h, --help,         Help for Importing libraries from the './app/project/libraries/' folder
    -z, --zipFile,      Prefix for full location path of the zip file to be imported
    -l, --list,         Prefix for list of file names
    -f, --force         Force the program to overwrite the target files with the source files and avoid any confirmation
    --all,              Select this option to import all the files

You could use `ch5-shell-cli` to import the complete contents of the zip file to './app/project/libraries/' folder (replace {path} with the location of the exported zip file):
    yarn import:library -z {path} --all

You could also use `yarn` or `npm run` to import library. The following are the commands:
    yarn import:library -z {path} --all
    npm run import:library -- -z {path} --all

You could use shortcut script `imp:l` with yarn and npm commands as the following:
    yarn imp:l
    npm run imp:l

Import selected libraries from './app/project/libraries/' folder. In this case, the filenames are mandatory in the command prompt. The filename must follow the complete path starting from './app/project/libraries/....'. Only filenames can be provided here (no folder paths). Multiple file names can be provided in the command prompt. To achieve this, use the following commands:
    yarn import:library -z ./dist/exported-library.zip -l ./app/project/libraries/a.js ./app/project/libraries/b.js
    npm run import:library -- -z ./dist/exported-library.zip -l ./app/project/libraries/a.js ./app/project/libraries/b.js
    yarn import:library -z ./dist/exported-library.zip --list ./app/project/libraries/a.js ./app/project/libraries/b.js
    npm run import:library -- -z ./dist/exported-library.zip --list ./app/project/libraries/a.js ./app/project/libraries/b.js
    yarn imp:l -z ./dist/exported-library.zip -l ./app/project/libraries/a.js ./app/project/libraries/b.js
    npm run imp:l -- -z ./dist/exported-library.zip -l ./app/project/libraries/a.js ./app/project/libraries/b.js

```

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

Parameters for "import:library" are as follows:

- "requiredFolderPath": "./app/project/libraries/" - This indicates the folder path of the project asset files.
- "templatesPath": `./node_modules/@crestron/ch5-shell-utilities-cli/build/cli/delete-components/templates` - This indicates the path where  the shell-utilities templates can be found.
- "outputFileName": "imported-libraries.zip" - This indicates the output zip file name.
- "outputTempFolderName": "Imported-Libraries-Code-Folder-Temp" - This indicates the temporary path created for copying output files.
- "zipFolderName": "imported-libraries", - This is the name of the folder inside outputTempFolderName where the zip file will be created.
- "zipFileDestinationPath": "./dist/", - This is the path where the zip file will be created. Ensure that it starts with './' and ends with '/'.
- "exportedFolderName": Indicates the name of the folder that was used for exporting the zip file during export:libraries process.

### Copyright

Copyright (C) 2021 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
