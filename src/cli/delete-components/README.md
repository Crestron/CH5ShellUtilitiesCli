# Shell Template - Delete Components

The 'Delete Components' function is used to remove one or more PAGE or WIDGET - type components. This script will only remove components from the /app/project/components directory.

## How to Use

To delete component(s), go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli delete:components`.
The package.json has scripts to handle this execution -for yarn, use `yarn delete:components` command or npm  `npm run delete:components` command. The short hand for it is `yarn del:c` or `npm run del:c` within scripts of package.json.

To access help, execute `ch5-shell-cli delete:components --help`. Note that, replacing `ch5-shell-cli` with `yarn` or `npm run` will also execute the script.

```bash
Usage: 
    ch5-shell-cli delete:components [options]

You could also use `yarn` or `npm run` to delete components. The following are the commands:
    yarn delete:components [options]
    npm run delete:components [options]

Options:
    -h, --help          Help for deleting components
    -l, --list,         Prefix for list of component names to be deleted
    -f, --force         Forces the script to delete the component without asking for a confirmation

You could use ch5-shell-cli to delete components with additional options. The following are some examples:
    ch5-shell-cli delete:components --list page6 page5
    ch5-shell-cli delete:components -l page6
    ch5-shell-cli delete:components --list page6 --force
    ch5-shell-cli delete:components -l page6 -f

You could also use `yarn` or `npm run` to export assets. The following are the commands:
    yarn delete:components --list page6 page5
    yarn delete:components -l page6
    yarn delete:components --list page6 --force
    yarn delete:components -l page6 -f
    npm run delete:components -- --list page6 page5
    npm run delete:components -- -l page6
    npm run delete:components -- --list page6 --force
    npm run delete:components -- -l page6 -f

You could use shortcut script `del:c` with yarn and npm commands as the following:
    yarn del:c
    npm run del:c
```

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at `./node_modules/@crestron/ch5-shell-utilities-cli/build/cli/delete-components/files/config.json`.

Parameters for "deleteComponents" are as follows:
`-- list` | `-l`: parameter to receive a list of components to be deleted.
`--force` | `-f`: parameter to execute the command for the component to be deleted without asking for a confirmation.

Parameters for "logger" are as follows:

- "allowLogging": false - Applicable values are true / false. This can be used for developer debugging.
- "logLevel": 1 - Indicates the logging levels for developer debugging. Applicable values can be found in logger.js file.

### Copyright

Copyright (C) 2021 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
