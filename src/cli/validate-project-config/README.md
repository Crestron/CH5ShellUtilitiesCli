# Validate Project Config

To validate the project-config.json file, go to the command-prompt or terminal of the Shell Template Project, and then execute `ch5-shell-cli validate:projectconfig`.

## How to Use

To validate projectconfig, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli validate:projectconfig`.
The package.json has scripts to handle this execution - `npm run validate:projectconfig` command. The short hand for it is `npm run val:pc` within scripts of package.json.

The 'Project Config' is used to validate the project-config.json file using command-line statements.

To access help, execute `ch5-shell-cli validate:projectconfig --help` or `npm run validate:projectconfig -- --help`.

```bash
Usage:
    ch5-shell-cli validate:projectconfig
    
You could also use `npm run` to import components. The following are the command(s)
    npm run validate:projectconfig

You could use shortcut script `val:pc`:
    ch5-shell-cli val:pc

You could use shortcut script `val:pc` with npm command as the following:
    npm run val:pc

Based on the responses, the output is classified into errors and warnings. 
The project-config.json is validated for the following cases:

    1. Validate project-config.json based on project-config-schema.json
    2. Verify if the pages defined in project-config.json exists in the physical folders.
    3. Verify if the widgets defined in project-config.json exists in the physical folders.
    4. Verify if the pages names are repeated in project-config.json
    5. Check if the widget names are repeated in project-config.json
    6. Check if the page sequences are repeated.
    7. Check if the theme name is not available in the list of mentioned themes.
    8. Check if the theme name is repeated in the themes array.
    9. If menuOrientation is either 'vertical' or 'horizontal', then check if atleast one navigation item exists in the pages list.
    10. Check if the menuOrientation is 'vertical', and if there is an 'IconPosition' defined for navigation.
    11. Check if the menuOrientation is 'vertical', and if the menu is displayed.
    12. Check if the Pages array is empty.
    13. Check if page names are reused in widgets and vice-versa.

This validation will review the settings in project configuration file and inform the developer of any invalid configuration before running the browser or running on the touch screen. During the 'start' / 'build' process, this script will be executed and if there are errors (not warning), the script will not continue to the next step.
```


### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
