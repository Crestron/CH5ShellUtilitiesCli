# Generate Page

The 'generate page' function creates new pages using command-line statements.

## How to Use

To generate page, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli generate:page`.
The package.json has scripts to handle this execution - `npm run generate:page` command. The short hand for it is `npm run gen:p` within scripts of package.json.

To create a page, go to the command-prompt or terminal of the Shell Template Project, and execute `npm run generate:page`

To access help for 'generate page', execute `npm run generate:page -- --help`

The page files will be created inside `./app/project/components/pages/{page}` folder.

```bash
Usage:
    ch5-shell-cli generate:page [options]
    
You could also use `npm run` to generate pages. The following are the command(s):
    npm run generate:page -- [options]

You could use shortcut script `gen:p` with options:
    ch5-shell-cli gen:p [options]

You could use shortcut script `gen:p` with npm command as the following:
    npm run gen:p -- [options]

Options:
    -h, --help          Help for Generate Documentation
    -n, --name          Set the Name of the page to be created
    -m, --menu          Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n')

You could use `ch5-shell-cli` to generate pages with additional options. The following are some examples:
    ch5-shell-cli generate:page --name LEDLights
    ch5-shell-cli generate:page -n LEDLights
    ch5-shell-cli generate:page --name LEDLights --menu Y
    ch5-shell-cli generate:page -n LEDLights -m Y
    ch5-shell-cli gen:p --name LEDLights
    ch5-shell-cli gen:p -n LEDLights
    ch5-shell-cli gen:p --name LEDLights --menu Y
    ch5-shell-cli gen:p -n LEDLights -m Y
    
You could also use `npm run` to generate pages. The following are the command(s):
    npm run generate:page --  --name LEDLights
    npm run generate:page --  -n LEDLights
    npm run generate:page --  --name LEDLights --menu N
    npm run generate:page --  -n LEDLights -m N
    npm run gen:p --  --name LEDLights
    npm run gen:p --  -n LEDLights
    npm run gen:p --  --name LEDLights --menu N
    npm run gen:p --  -n LEDLights -m N

The Page Name is mandatory to create a page. It must start with a letter and can contain letters, hyphens, spaces, underscores and numbers.

If page name is not provided in the 'generate:page' command, or if the page name is incorrect, the developer will be prompted to enter a page name, and a default value for the page name will be displayed. This page name will be defaulted with the below business rules:
    • Set the name of page as 'PageX', where 'X' is an incremental number.
    • If 'PageX' already exists, then X is incremented by 1.

Examples:
 • List of existing pages: Page1, Page2, Page04, Page3. New prompted page name is Page4
 • List of existing pages: Page1, Page2, Page6, Page7. New prompted page name is Page3

The developer can accept the default page name, or can change the default page name as needed. The default is page name is displayed as a placeholder in the terminal window. Some additional features to modify default page name are:
• Click the 'Tab' key to make changes to this value.
• Click the 'Enter' key to accept the page name.
• Start typing on the placeholder to create a custom page name.

Based on the input for page name, the following will be the generated pages and file or folder names:

| No  | Input Page Name | Generated Page Name | Generated File and Folder Names |
| --- | --------------- | ------------------- | ------------------------------- |
| 01  | LEDLights       | ledlights           | ledlights                       |
| 02  | ledlights       | ledlights           | ledlights                       |
| 03  | LEDLIGHTS       | ledlights           | ledlights                       |
| 04  | LED-Lights      | ledLights           | led-lights                      |
| 05  | LED_Lights      | ledLights           | led-lights                      |
| 06  | led-lights      | ledLights           | led-lights                      |
| 07  | led_lights      | ledLights           | led-lights                      |
| 08  | led lights      | ledLights           | led-lights                      |

Each page generated will contain the following files:

- {page}.html
- {page}.js
- {page}.scss
- {page}-emulator.json

The page files will be created inside `./app/project/components/pages/{page}` folder. 

```

## Understanding the generated code

### {page}.html

The generated file consists of the following:

1. Section - Based on the name of the page as expressed in the table above.

### {page}.js

The generated file consists of the following:

1. Page Module - Based on the name of the page as expressed in the table above.
2. An onInit() method that gets called once the html-importsnippet is loaded.

### {page}.scss

The generated file consists of the following:

1. Id - Based on the name of the page as expressed in the table above. This must not be removed, and all css must be added inside this id.

### {page}-emulator.json

This file is created for any emulator json file related to the page.

### Changes to project-config.json

A file named 'project-config.json' is located in the './app/' directory. This file is updated each time a new component is created. A new node is created in 'content/pages' that is in 'project-config.json'.

```bash
    {
        "pageName": "page1",
        "fullPath": "./app/project/components/pages/page1/",
        "fileName": "page1.html",
        "preloadPage": true,
        "cachePage": false,
        "standAloneView": false,
        "navigation": {
          "sequence": 1,
          "label": "menu.page1",
          "isI18nLabel": true,
          "iconClass": "fas fa-file-alt",
          "iconUrl": "",
          "iconPosition": "bottom"
        }
    }
```

Refer to the project-config.json section for more details regarding the newly generated node.

### Notes

Page Names that are not allowed are

- Pages starting with 'template'
- Names of Pages / Widgets / Modules used in ./app/template folder like 'service', 'translate' and so forth.

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.