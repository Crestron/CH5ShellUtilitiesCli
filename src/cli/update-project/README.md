# Create Project

To create a project, go to the command-prompt or terminal where you want to create the project, and then execute run the command `ch5-shell-cli create:project`.

## How to Use


Write a CLI command to create project. There are two ways to create a project using CLI. 

a.

 ch5-shell-cli create:project --config ./a/b/c.json
Provide a json file that will be used to create the project (details of the json file can be similar to project-config.json). The user will not be prompted for any further information, and all details will be picked from the json file. The details are as mentioned in the point b.

 

ch5-shell-cli create:project --default
This will create a project with 6 pages which is the default.

 

ch5-shell-cli create:project --blank
This will create a project with one blank page

 

b. 

ch5-shell-cli create:project
Since the json file is not provided, user will be asked queries for additional information to create the project. The information includes:

Project Name

menuOrientation

selectedTheme

useWebXPanel

No. of pages to be created

Though the user might need more data in project-config.json, asking too many questions to the user might be a cumbersome process from a user experience perspective.


Write a CLI command to update project.

ch5-shell-cli update:project --defaultView “page1”

Write a CLI command to update project. There are two ways to update a project using CLI.

a. ch5-shell-cli update:project --config ./a/b/c.json

Provide a json file that will be used to update the project (details of the json file can be similar to project-config.json). The user will not be prompted for any further information, and all details will be picked from the json file. 

If this json file has newer pages, then they will be added.

If this json file does not have existing pages, they will be removed from the project.

Json file attributes will override the project json.

if a json file is provided, a confirmation will be requested by the script for updating the project. You can pass --force to override the confirmation.

b. ch5-shell-cli update:project

Since the json file is not provided, user will need to specify individual updates for each section. The details for each section are available as subtasks. A minimum of 1 parameter has to be provided for each update. 

Write a CLI command to update project. 

ch5-shell-cli update:project --menuOrientation vertical

Write a CLI command to update project.

ch5-shell-cli update:project --selectedTheme "light-theme"

Themes list can be.updated (and new themes added) only from JSON file (https://crestroneng.atlassian.net/browse/CH5C-2070)

Write a CLI command to update project.

ch5-shell-cli update:project --webXPanel false

Write a CLI command to update project.

ch5-shell-cli update:project --displayHeader false

ch5-shell-cli update:project --displayHeaderInfo false

ch5-shell-cli update:project --headerComponent “page1”

ch5-shell-cli update:project --footerComponent “page1”

ch5-shell-cli update:project --displayFooter false






To validate projectconfig, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli validate:projectconfig`.
The package.json has scripts to handle this execution - for yarn, use `yarn validate:projectconfig` command or npm  `npm run validate:projectconfig` command. The short hand for it is `yarn val:pc` or `npm run val:pc` within scripts of package.json.

The 'Project Config' is used to validate the project-config.json file using command-line statements.

To access help, execute `ch5-shell-cli validate:projectconfig --help` or `yarn validate:projectconfig --help` or `npm run validate:projectconfig -- --help`.

```bash
Usage:
    ch5-shell-cli validate:projectconfig
    
You could also use `yarn` or `npm run` to import components. The following are the commands
    yarn validate:projectconfig
    npm run validate:projectconfig

You could use shortcut script `val:pc`:
    ch5-shell-cli val:pc

You could use shortcut script `val:pc` with yarn and npm commands as the following:
    yarn val:pc
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

### How to test

npm pack / yarn pack

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.