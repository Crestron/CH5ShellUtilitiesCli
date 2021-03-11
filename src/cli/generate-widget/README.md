# Shell Template - Generate Widget

The 'generate widget' function creates new widgets using command-line statements.
 
## Installation

### Install Dependencies

*npm i enquirer --save-dev*

*npm i rimraf --save-dev*

*npm i config --save-dev*

*npm i edit-json --save-dev*

## How to Use
To create a widget, go to the command-prompt or terminal of the Shell Template Project, and execute `yarn generate:widget` or `npm run generate:widget`.

To access help for 'generate widget', execute `yarn generate:widget --help` or `npm run generate:widget -- --help`

```
Usage: yarn generate:widget [options]

Options:
    -h, --help          Help for Generate Documentation
    -n, --name          Set the Name of the widget to be created

You could use Yarn / npm to generate widgets. The following are the commands:
    yarn generate:widget
    npm run generate:widget

You could use shortcuts as the following:
    yarn gen:w
    npm run gen:w

You could use Yarn / npm to generate widgets with additional options. The following are some examples:
    yarn gen:w --name LEDLights
    yarn gen:w -n LEDLights
    npm run gen:w --  --name LEDLights
    npm run gen:w --  -n LEDLights
```

The widget name is mandatory to create a widget. It must start with a letter and can contain letters, hyphens, spaces, underscores, and numbers. 

If the widget name is not provided in the 'generate:widget' command, or if the widget name is incorrect, the developer will be prompted to enter a widget name, and a default value for the widget name will be displayed. This widget name will be set with the following rules:
    • Sets the name of widget as 'WidgetX', where 'X' is an incremental number.
    • If 'WidgetX' already exists, then X is incremented by 1.

Examples:
	• For a list of existing widgets (Widget1, Widget2, Widget04, Widget3), the new prompted widget name would be Widget4.
	• For a list of existing widgets (Widget1, Widget2, Widget6, Widget7), the new prompted widget name would be Widget3.

The developer can accept the default widget name, or can change the default widget name as needed. The default is widget name is displayed as a placeholder in the terminal window. Some additional features to modify default widget name are as follows:
    • Click the 'Tab' key to make changes to this value. 
    • Click the 'Enter' key to accept the widget name.
    • Start typing on the placeholder to create a custom widget name.

Based on the input for widget name, the following will be the generated widgets and file or folder names:

| No | Input Widget Name    | Generated Widget Name     | Generated File and Folder Names |
| -- | -------------------- | ------------------------- | ------------------------------- |
| 01 | LEDLights            | ledlights                 | ledlights                       |
| 02 | ledlights            | ledlights                 | ledlights                       |
| 03 | LEDLIGHTS            | ledlights                 | ledlights                       |
| 04 | LED-Lights           | ledLights                 | led-lights                      |
| 05 | LED_Lights           | ledLights                 | led-lights                      |
| 06 | led-lights           | ledLights                 | led-lights                      |
| 07 | led_lights           | ledLights                 | led-lights                      |
| 08 | led lights           | ledLights                 | led-lights                      |

Each widget generated will contain the following files:
- {widget}.html
- {widget}.js
- {widget}.scss
- {widget}-emulator.json

The widget files will be created inside `./app/project/components/widgets/{widget}` folder. 

## Understanding the generated code

All template files are available in the folder `./shell-utilities/generate-widget/templates`.

### {widget}.html
This generated file consists of the following:
1. *template* tag - A *template* tag is created with an attribute of 'id' which is a combination of the widget name (based on the name of the widget as expressed in the table above) with '-widget' as a suffix. This suffix is important to minimize any duplication of widgets with other auto generated code (like page generation).
2. *div* tag - A *div* tag is created inside the *template* tag and is styled with a class reference, which is a combination of the widget name (based on the name of the widget as expressed in the table above) with '-widget' as a suffix. This class reference is the parent class defined in {widget}.scss file.

### {widget}.js
The generated file consists of the following:
1. Widget Module - Based on the name of the widget as expressed in the table above.
2. An onInit() method that gets called in the 'afterLoad' event listener.
3. One public method getOutput()
4. Returns public method.

### {widget}.scss
The parent CSS selector created is .{widget}-widget in this file. This is based on the id of the widget's template tag. This class must not be removed, and all SCSS / CSS related to the widget must be added inside this class.

### {widget}-emulator.json
This file is created for any emulator json file related to the widget.


### Changes to project-config.json
A file named 'project-config.json' is located in the './app/' directory. This file is updated each time a new component is created. A new node is created in 'content/widgets' that is in 'project-config.json'. 

```
    {
        "widgetName": "widget1",
        "fullPath": "./app/project/components/widgets/widget1/",
        "fileName": "widget1.html",
        "widgetProperties": {}
      }
```

Refer to the project-config.json section for more details regarding the newly generated node.


### Change Configuration Parameters

All configuration parameters are available in the default.json file located at './shell-utilities/config/'.

Parameters for "generateWidget" are
- "basePathForWidgets": "./app/project/components/widgets/" - This indicates the path where the widget will be generated.
- "templatesPath": "./shell-utilities/generate-widget/templates/" - This indicates the path where the templates can be found.
- "minLengthOfWidgetName": 2 - The minimum length for widget name.
- "maxLengthOfWidgetName": 31 - The maximum length for widget name.

Widget Names that are not allowed are
- Widgets starting with 'template'
- Names of Widgets / Pages / Modules used in ./app/template folder like 'service', 'translate', and so forth.
	
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
