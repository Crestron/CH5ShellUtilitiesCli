# Shell Template - Export Project

'Export Project' exports the project code (removing the excluded files) using command-line statements.
 
## Installation

### Install Dependencies

*npm i rimraf --save-dev*

*npm i fs-extra --save-dev*

*npm i zip-lib --save-dev*

*npm i config --save-dev*


## How to Use
To export the project, go to the command-prompt / terminal of the Shell Template Project, and execute `yarn export:project` or  `npm run export:project`. 

To access help, you need to execute `yarn export:project --help` or `npm run export:project -- --help`.

```
Usage: yarn export:project [options]

Options:
    -h, --help,         Help for Exporting project code

You could use Yarn / npm to export the project code. The below are the commands:
    yarn export:project
    npm run export:project
```

By default, the zip file is created inside the project 'dist' folder. This file has the naming convention of {fileName}.zip
The file name is picked from 'name' parameter in package.json file

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at ./shell-utilities/config/

Parameters for "export" are
- "templatesPath": "./shell-utilities/export-project/templates/" - This indicates the path where the templates can be found
- "ignoreFilesFolders": Indicates all the files / folders that must not be included in the zip file.
- "zipFileDestinationPath": "./dist/", - This is the path where the zip file will be created. Ensure that it starts with './' and ends with '/'.

### Copyright
Copyright (C) 2020 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement 
under which you licensed this source code. 