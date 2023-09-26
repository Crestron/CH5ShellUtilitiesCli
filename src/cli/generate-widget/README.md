# Generate Widget

The 'generate widget' function creates new widgets using command-line statements.

## How to Use

To generate widget, go to the command-prompt or terminal of the Shell Template project, and execute `ch5-shell-cli generate:widget`.
The package.json has scripts to handle this execution - for npm, use `npm run generate:widget` command. The short hand for it is `npm run gen:w` within scripts of package.json.

To create a widget, go to the command-prompt or terminal of the Shell Template Project, and execute `npm run generate:widget`.

To access help for 'generate widget', execute `npm run generate:widget -- --help`

The widget files will be created inside `./app/project/components/widgets/{widget}` folder.

```bash
Usage:
    ch5-shell-cli generate:widget [options]
    
You could also use `npm run` to generate widgets. The following are the command(s):
    npm run generate:widget -- [options]

You could use shortcut script `gen:w` with options:
    ch5-shell-cli gen:w [options]
    
You could use shortcut script `gen:w` with npm command as the following:
    npm run gen:w -- [options]
    
Options:
    -h, --help          Help for Generate Documentation
    -n, --name          Set the Name of the widget to be created

You could use `ch5-shell-cli` to generate widgets with additional options. The following are some examples:
    ch5-shell-cli generate:widget --name LEDLights
    ch5-shell-cli generate:widget -n LEDLights
    ch5-shell-cli gen:w --name LEDLights
    ch5-shell-cli gen:w -n LEDLights
    
You could also use `npm run` to generate widgets. The following are the command(s):
    npm run generate:widget --  --name LEDLights
    npm run generate:widget --  -n LEDLights
    npm run gen:w --  --name LEDLights
    npm run gen:w --  -n LEDLights

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
```

## Understanding the generated code

### {widget}.html

This generated file consists of the following:

1. *template* tag - A *template* tag is created with an attribute of 'id' which is a combination of the widget name (based on the name of the widget as expressed in the table above) with '-widget' as a suffix. This suffix is important to minimize any duplication of widgets with other auto generated code (like page generation).
2. *div* tag - A *div* tag is created inside the *template* tag and is styled with a class reference, which is a combination of the widget name (based on the name of the widget as expressed in the table above) with '-widget' as a suffix. This class reference is the parent class defined in {widget}.scss file.

### {widget}.js

The generated file consists of the following:

1. Widget Module - Based on the name of the widget as expressed in the table above.
2. An onInit() method that gets called in the ch5-import-htmlsnippet load listener.

### {widget}.scss

The parent CSS selector created is .{widget}-widget in this file. This is based on the id of the widget's template tag. This class must not be removed, and all SCSS / CSS related to the widget must be added inside this class.

### {widget}-emulator.json

This file is created for any emulator json file related to the widget.

### Changes to project-config.json

A file named 'project-config.json' is located in the './app/' directory. This file is updated each time a new component is created. A new node is created in 'content/widgets' that is in 'project-config.json'.

```bash
    {
        "widgetName": "widget1",
        "fullPath": "./app/project/components/widgets/widget1/",
        "fileName": "widget1.html"
    }
```

Refer to the project-config.json section for more details regarding the newly generated node.

### Notes

Widget Names that are not allowed are

- Widgets starting with 'template'
- Names of Widgets / Pages / Modules used in ./app/template folder like 'service', 'translate', and so forth.

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.