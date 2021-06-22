# Shell Template - Export Project

'Export Project' exports the project code (removing the excluded files) using command-line statements.

## How to Use

To export project, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli export:project`.
The package.json has scripts to handle this execution - for yarn, use `yarn export:project` command or npm  `npm run export:project` command. The short hand for it is `yarn exp:p` or `npm run exp:p` within scripts of package.json.

To export the project, go to the command-prompt / terminal of the Shell Template Project, and execute `yarn export:project` or  `npm run export:project`.

To access help, you need to execute `yarn export:project --help` or `npm run export:project -- --help`.

By default, the zip file is created inside the project 'dist' folder. This file has the naming convention of {fileName}.zip
The file name is picked from 'name' parameter in package.json file

```bash
Usage: 
    ch5-shell-cli export:project [options]
    
You could also use `yarn` or `npm run` to export project. The following are the commands:
    yarn export:project [options]
    npm run export:project [options]

You could use shortcut script `exp:p` with yarn and npm commands as the following:
    yarn exp:p
    npm run exp:p

Options:
    -h, --help,         Help for Exporting project code

Export the complete project from './app/' folder. To achieve this, use the below commands:
    ch5-shell-cli export:project --all
```

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at ./shell-utilities/config/

Parameters for "export" are

- "templatesPath": `./node_modules/@crestron/ch5-shell-utilities-cli/build/cli/delete-components/templates` - This indicates the path where the templates can be found
- "ignoreFilesFolders": Indicates all the files / folders that must not be included in the zip file.
- "zipFileDestinationPath": "./dist/", - This is the path where the zip file will be created. Ensure that it starts with './' and ends with '/'.

### Copyright

Copyright (C) 2021 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
