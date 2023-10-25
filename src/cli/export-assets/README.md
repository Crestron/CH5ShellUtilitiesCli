# Export Assets

'Export Assets' exports assets from the './app/project/assets/' folder (removing the excluded files) using command-line statements.

## How to Use

To export assets, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli export:assets`.
The package.json has scripts to handle this execution - for npm, use `npm run export:assets` command. The short hand for it is `npm run exp:a` within scripts of package.json.

To access help, execute `ch5-shell-cli export:assets --help`. Note that, replacing `ch5-shell-cli` with `npm run` will also execute the script.

By default, the zip file is created inside the project 'dist' folder. This file has the naming convention of `exported-assets.zip`.

```bash
Usage: 
    ch5-shell-cli export:assets [options]

You could also use `npm run` to export assets. The following are the command(s):
    npm run export:assets -- [options]

You could use shortcut script `exp:a` with options:
    ch5-shell-cli exp:a [options]

You could use shortcut script `exp:a` with npm commands as the following:
    npm run exp:a -- [options]

Options:
    -h, --help,         Display help for command
    -l, --list,         Prefix for list of file names
    --all               Select this option to export all the files

Export the complete assets directory from './app/project/assets/' folder. To achieve this, use the below commands:
    ch5-shell-cli export:assets --all

You could also use `npm run` to export assets. The following are the command(s):
    npm run export:assets -- --all
    npm run exp:a -- --all

Export selected assets from './app/project/assets/' folder. In this case, the file names are mandatory in the command-prompt. The filename must follow the complete path starting from './app/project/assets/....'. Only file names can be provided here (no folder paths). Multiple file names can be provided in the command-prompt. To achieve this, use the below commands:
    ch5-shell-cli export:assets -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss
    ch5-shell-cli export:assets --list ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss     
    ch5-shell-cli exp:a -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

You could also use `npm run` to export assets. The following are the command(s):
    npm run export:assets -- -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss
    npm run export:assets -- --list ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss
    npm run exp:a -- -l ./app/project/assets/data/translation/en.json ./app/project/assets/scss/_variables.scss

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