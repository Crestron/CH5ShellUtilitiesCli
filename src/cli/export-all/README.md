# Export All

'Export All' exports assets, libraries, and components from the './app/project/' folder (removing the excluded files) using command-line statements.

## How to Use

To export all, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli export:all`.
The package.json has scripts to handle this execution - for npm, use `npm run export:all` command.

To access help, execute `ch5-shell-cli export:all --help`. Note that, replacing `ch5-shell-cli` with `npm run` will also execute the script.

By default, the zip file is created inside the project 'dist' folder. This file has the naming convention of exported-all.zip

```bash
Usage: 
    ch5-shell-cli export:all [options]

You could also use `npm run` to export assets, libraries, and components. The following are the command(s):
    npm run export:all -- [options]

Options:
    -h, --help,         Display help for command
    -l, --list,         Prefix for list of file names
    --all               Select this option to export all the files

Export the complete project directory from './app/project/' folder. To achieve this, use the below command:
    ch5-shell-cli export:all --all

You could also use `npm run` to export complete project directory. The following are the command(s):
    npm run export:all -- --all

Export selected files from './app/project/' folder. In this case, the file names are mandatory in the command-prompt. The filename must follow the complete path starting from './app/project/assets/....'. Only file names can be provided here (no folder paths). Multiple file names can be provided in the command-prompt. To achieve this, use the below commands:
    ch5-shell-cli export:all -l ./app/project/assets/data/translation/en.json ./app/project/components/pages/page1/page1.html
    ch5-shell-cli export:all --list ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss

You could also use `npm run` to export all. The following are the command(s):
    npm run export:all -- -l ./app/project/components/pages/page1/page1.html ./app/project/assets/scss/_variables.scss
    npm run export:all -- --list ./app/project/assets/data/translation/en.json ./app/project/components/pages/page1/page1.html

```

### Use Tab Completion Feature

#### Tab Completion on Windows

The Windows Command Prompt does not allow you to use tab completion for commands and their options. However, it does support tab completion for folder and file names.

For example, we can open a Command Prompt, type cd D, and press Tab. As we are in our user folder by default, tab completion will automatically file in cd Desktop, so we can press Enter to change directories to our desktop directory. This also helps when trying to run a command on a specific file name.

Tab completion also works in PowerShell. It can be used to automatically fill in the name of a file path.

Unlike in the Bash Shell, Windows requires you press Tab multiple times to cycle through available options — it won’t just show you them all in a list. This applies to both the Command Prompt and PowerShell’s tab completion features.

#### Tab Completion on Linux

Tab completion is especially useful when typing file names, directories, and paths. Rather than trying to type a long file name that may involve spaces and special characters you will need to properly escape, you can just start typing the beginning of the name and press Tab.

For example, if we have a long, complex file name beginning with the letter L, we just have to type L and press Tab to automatically complete it. If we had multiple file names beginning with L, we just need to type a bit more of the file’s name before pressing Tab again.

#### Tab Completion on Mac OS

Mac OS X also includes the Bash shell, so tab completion works just like it does on Linux. Tap the tab key while typing a command, file path, or option — the shell will automatically fill in the rest or show you the available options you can type.

Any other operating system that uses the Bash shell will work the same. Tab completion features should also work similarly on many other shells on Unix-like systems.


### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.