# Export Project

'Export Project' exports the project code (removing the excluded files) using command-line statements.

## How to Use

To export project, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli export:project`.
The package.json has scripts to handle this execution - `npm run export:project` command. The short hand for it is `npm run exp:p` within scripts of package.json.

To export the project, go to the command-prompt / terminal of the Shell Template Project, and execute `npm run export:project`.

To access help, you need to execute `npm run export:project -- --help`.

By default, the zip file is created inside the project 'dist' folder. This file has the naming convention of {fileName}.zip
The file name is picked from 'name' parameter in package.json file

```bash
Usage: 
    ch5-shell-cli export:project
    
You could also use `npm run` to export project. The following are the command(s):
    npm run export:project

You could use shortcut script `exp:p` with options:
    ch5-shell-cli exp:p

You could use shortcut script `exp:p` with npm command as the following:
    npm run exp:p

```

### Notes

Included files for exporting the project are picked up from 'Shell Template' package.json file (the node is files: [ ]). If any files are missing in export, please add the file names to package.json -> files node.

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.