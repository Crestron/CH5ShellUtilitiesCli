# Import Components

The 'Import Components' function imports components to the './app/project/components/' folder using command line statements.

## How to Use

To import components, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli import:components`.
The package.json has scripts to handle this execution - `npm run import:components` command. The short hand for it is `npm run imp:c` within scripts of package.json.

To access help, execute `ch5-shell-cli import:components --help` or `npm run import:components -- --help`.

```bash
Usage:
    ch5-shell-cli import:components [options]
    
You could also use `npm run` to import components. The following are the command(s):
    npm run import:components -- [options]

You could use `ch5-shell-cli` to import the complete contents of the zip file to './app/project/components/' folder.
    ch5-shell-cli import:components -z {path} --all

You could also use `npm run` to import components. The following are the command(s):
    npm run import:components -- -z {path} --all

You could use shortcut script `imp:c` with options:
    ch5-shell-cli imp:c [options]

You could use shortcut script `imp:c` with npm command as the following:
    npm run imp:c -- [options]

Options:
    -h, --help,         Display help for command
    -z, --zipFile,      Prefix for full location path of the zip file to be imported
    -l, --list,         Prefix for list of file names
    -f, --force         Force the program to overwrite the target files with the source files and avoid any confirmation
    --all,              Select this option to import all the files
    
Import selected components from './app/project/components/' folder. In this case, the filenames are mandatory in the command prompt. The filename must follow the complete path starting from './app/project/components/....'. Only file names can be provided here (no folder paths). Multiple file names can be provided in the command prompt. To achieve this, use the following commands:
    ch5-shell-cli import:components -z ./dist/exported-components.zip -l ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html
    ch5-shell-cli import:components -z ./dist/exported-components.zip --list ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html
    ch5-shell-cli imp:c -z ./dist/exported-components.zip -l ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html

You could also use `npm run` to import selected components from './app/project/components/' folder. The following are the command(s):
    npm run import:components -- -z ./dist/exported-components.zip -l ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html
    npm run import:components -- -z ./dist/exported-components.zip --list ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html
    npm run imp:c -- -z ./dist/exported-components.zip -l ./app/project/components/pages/page1/page1.html ./app/project/components/widgets/pagedisplay/pagedisplay.html

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


### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
