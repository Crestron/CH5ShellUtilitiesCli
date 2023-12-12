# Update Project

To update a project, go to the command-prompt or terminal of the existing project directory, and then execute run the command `ch5-shell-cli update:project`.

## How to Use

```bash
Usage:
    ch5-shell-cli update:project [options]

```

The package.json in the shell template project has scripts to handle this execution - `npm run update:project` command.

There are two ways to update a project using CLI. 

a. Passing a configuration JSON file: This file is similar to project-config.json. The project can be updated with customized content like 'selectedTheme', newer pages and widgets, list of themes etc.. The user will not be prompted for any further information, and all details will be picked from the json file.

`ch5-shell-cli update:project --config ./downloads/sample-config.json`

b. Passing the key and the value required to be updated in the project-config.json file:

`ch5-shell-cli update:project --projectName "my-new-shell-template"`
`ch5-shell-cli update:project --selectedTheme "dark-theme"`

Since the json file is not provided, user will need to atleast 1 argument. Multiple arguments can be provided as well to update multiple values in the project-config.json file.

`ch5-shell-cli update:project --menuOrientation "horizontal" --useWebXPanel "true"`

### Validations and Important points

1. Validation for projectName argument are as follows:
    - project name length should be greater than zero and cannot exceed 214
    - project name characters must be lowercase i.e., no uppercase or mixed case names are allowed
    - project name can consist of hyphens, tilde, numbers and alphabets
    - project name can consist of underscore and dot but these cannot start with these characters
    - project name should not end with a dot
    - project name must not contain any non-url-safe characters (since name ends up being part of a URL)
    - project name should not contain any spaces or any of the following characters: ! @ # $ % ^ & * ( ) + = [ { } ] | \ : ; " ' < , > ? /

2. All argument names like projectName, menuOrientation etc are exactly the same as defined in project-config.json. Only exception is 'version'. To update version, you will need to use `ch5-shell-cli update:project --projectVersion "1.0.0"`

3. Pages / widgets can be added using the configuration file method. If there are newer pages / widgets in the config file (that do not exist in the project), then the new pages / widgets will be added. If the config file does not contain the pages / widgets defined in the project, then these pages will be deleted and cannot be restored. The configuration file values will override the project-config.json file in the project.

4. if a config file is used to update the project, a confirmation will be requested by the script for updating the project. You can pass --force to override the confirmation. If config file is added as an argument along with other parameters to the update:project command, then config file takes precedence, and other parameters are ignored.

5. To access help, execute `ch5-shell-cli update:project --help`.

6. projectType must be either shell-template or ZoomRoomControl. Default value is 'shell-template' if either projectType is not provided or is invalid.

7. forceDeviceXPanel must be either Y or N or true or false. Default value is false, if either forceDeviceXPanel is not provided or is invalid. If projectType is ZoomRoomControl, then the value of forceDeviceXPanel is always set to true. 


### Copyright

Copyright (C) 2023 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.