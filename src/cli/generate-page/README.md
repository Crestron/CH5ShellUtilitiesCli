# Shell Template - Generate Page

The 'generate page' function creates new pages using command-line statements.

## How to Use

To generate page, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli generate:page`.
The package.json has scripts to handle this execution - for yarn, use `yarn generate:page` command or npm  `npm run generate:page` command. The short hand for it is `yarn gen:p` or `npm run gen:p` within scripts of package.json.

To create a page, go to the command-prompt or terminal of the Shell Template Project, and execute `yarn generate:page` or `npm run generate:page`

To access help for 'generate page', execute `yarn generate:page --help` or `npm run generate:page -- --help`

The page files will be created inside `./app/project/components/pages/{page}` folder.

```bash
Usage:
    ch5-shell-cli generate:page [options]
    
You could also use `yarn` or `npm run` to generate pages. The following are the commands:
    yarn generate:page [options]
    npm run generate:page [options]

Options:
    -h, --help          Help for Generate Documentation
    -n, --name          Set the Name of the page to be created
    -m, --menu          Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n')

You could use `ch5-shell-cli` to generate pages with additional options. The following are some examples:
    ch5-shell-cli generate:page --name LEDLights
    ch5-shell-cli generate:page -n LEDLights
    ch5-shell-cli generate:page --name LEDLights --menu Y
    ch5-shell-cli generate:page -n LEDLights -m Y
    
You could also use `yarn` or `npm run` to generate pages. The following are the commands:
    yarn generate:page --name LEDLights
    yarn generate:page -n LEDLights
    yarn generate:page --name LEDLights --menu Y
    yarn generate:page -n LEDLights -m Y
    npm run generate:page --  --name LEDLights
    npm run generate:page --  -n LEDLights
    npm run generate:page --  --name LEDLights --menu N
    npm run generate:page --  -n LEDLights -m N

You could use shortcut script `gen:p` with yarn and npm commands as the following:
    yarn gen:p
    npm run gen:p

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

```

## Understanding the generated code

All template files are available in the folder `./shell-utilities/generate-page/templates`

### {page}.html

The generated file consists of the following:

1. Section Id - Based on the name of the page as expressed in the table above.
2. Title - Generated based on name of the page.
3. *div* tag - Styled with reference to the styles in {page}.scss file.

### {page}

The generated file consists of the following:

1. Page Module - Based on the name of the page as expressed in the table above.
2. An onInit() method that gets called in the 'afterLoad' event listener.
3. One public method getOutput()
4. Returns public method.

### {page}.scss

The generated file consists of the following:

1. Id - Based on the name of the page as expressed in the table above. This must not be removed, and all css must be added inside this id.
2. css selector .message-text for the *div* tag created in the generated html.

### {page}-emulator.json

This file is created for any emulator json file related to the page.

### Changes to project-config.json

A file named 'project-config.json' is located in the './app/' directory. This file is updated each time a new component is created. A new node is created in 'content/pages' that is in 'project-config.json'.

```bash
    {
        "pageName": "page7",
        "fullPath": "./app/project/components/pages/page7/",
        "fileName": "page7.html",
        "pageProperties": {
          "class": ""
        },
        "navigation": {
          "sequence": 7,
          "label": "page7",
          "iconClass": "",
          "iconUrl": "./app/project/assets/img/navigation/page.svg",
          "iconPosition": ""
        }
    }
```

Refer to the project-config.json section for more details regarding the newly generated node.

### Change Configuration Parameters

All configuration parameters are available in the default.json file located at './shell-utilities/config/'.

Parameters for "generatePage" are

- "basePathForPages": "./app/project/components/pages/" - This indicates the path where the page will be generated.
- "templatesPath": "./shell-utilities/generate-page/templates/" - This indicates the path where the templates can be found
- "minLengthOfPageName": 2 - The minimum length for page name
- "maxLengthOfPageName": 31 - The maximum length for page name

Page Names that are not allowed are

- Pages starting with 'template'
- Names of Pages / Widgets / Modules used in ./app/template folder like 'service', 'translate' and so forth.

Parameters for "logger" are

- "allowLogging": false - Applicable values are true / false. This can be used for developer debugging.
- "logLevel": 1 - Indicates the logging levels for developer debugging. Applicable values can be found in logger.js file.

### Copyright

Copyright (C) 2020 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.
