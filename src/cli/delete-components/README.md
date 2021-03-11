# Shell Template - Delete Components

The 'Delete Components' function is used to remove one or more page or widget-type components. This script will only remove components from the /app/project/components directory.
 
## Installation

### Install Dependencies

*npm i enquirer --save-dev*

*npm i rimraf --save-dev*

*npm i config --save-dev*

*npm i edit-json --save-dev*

## How to Use
To delete component(s), go to the command-prompt or terminal of the Shell Template project, then execute `yarn delete:components` or `npm run delete:components`

To access help for 'delete components', execute `yarn delete:components --help` or `npm run delete:components -- --help`

```

Usage: yarn delete:components [options]

Options:
    -h, --help          Help for Generate Documentation
    -l, --list,         Prefix for list of component names to be deleted
    -f, --force         Forces the script to delete the component without asking for a confirmation

You could use Yarn / NPM to delete components. The following are the commands:
    yarn delete:components
    npm run delete:components

You could use shortcuts as the following:
    yarn del:c
    npm run del:c

You could use Yarn / NPM to generate pages with additional options. The following are some examples:
    yarn del:c --list page6 page5
    yarn del:c -l page6
    yarn del:c --list page6 --force
    yarn del:c -l page6 -f
    npm run del:c -- --list page6 page5
    npm run del:c -- -l page6
    npm run del:c -- --list page6 --force
    npm run del:c -- -l page6 -f
  
```

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at ./shell-utilities/config/.

Parameters for "deleteComponents" are as follows:
- "templatesPath": "./shell-utilities/delete-components/templates/" - This indicates the path where the templates can be found
	
Parameters for "logger" are as follows:
- "allowLogging": false - Applicable values are true / false. This can be used for developer debugging.
- "logLevel": 1 - Indicates the logging levels for developer debugging. Applicable values can be found in logger.js file. 


### Copyright
Copyright (C) 2020 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement 
under which you licensed this source code. 
