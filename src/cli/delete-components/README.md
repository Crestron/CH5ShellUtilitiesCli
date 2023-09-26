# Delete Components

The 'Delete Components' function is used to remove one or more PAGE or WIDGET - type components. This script will only remove components from the /app/project/components directory.

## How to Use

To delete component(s), go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli delete:components`.
The package.json has scripts to handle this execution -for npm  `npm run delete:components` command. The short hand for it is `npm run del:c` within scripts of package.json.

To access help, execute `ch5-shell-cli delete:components --help`. Note that, replacing `ch5-shell-cli` with `npm run` will also execute the script.

```bash
Usage: 
    ch5-shell-cli delete:components [options]

You could also use `npm run` to delete components. The following are the command(s):
    npm run delete:components -- [options]

You could use shortcut script `del:c` with options:
    ch5-shell-cli del:c [options]

You could use shortcut script `del:c` with npm command as the following:
    npm run del:c -- [options]
    
Options:
    -h, --help          Display help for command
    -l, --list,         Prefix for list of component names to be deleted
    -f, --force         Forces the script to delete the component without asking for a confirmation

You could use ch5-shell-cli to delete components with additional options. The following are some examples:
    ch5-shell-cli delete:components --list page6 page5
    ch5-shell-cli delete:components -l page6
    ch5-shell-cli delete:components --list page6 --force
    ch5-shell-cli delete:components -l page6 -f
    ch5-shell-cli del:c --list page6 page5
    ch5-shell-cli del:c -l page6
    ch5-shell-cli del:c --list page6 --force
    ch5-shell-cli del:c -l page6 -f

You could also use `npm run` to delete components. The following are the command(s):
    npm run delete:components -- --list page6 page5
    npm run delete:components -- -l page6
    npm run delete:components -- --list page6 --force
    npm run delete:components -- -l page6 -f
    npm run del:c -- --list page6 page5
    npm run del:c -- -l page6
    npm run del:c -- --list page6 --force
    npm run del:c -- -l page6 -f

```

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.