# Update Project

To update a project, go to the command-prompt or terminal of the existing project directory, and then execute run the command `ch5-shell-cli update:project`.

## How to Use

```bash
Usage:
    ch5-shell-cli update:project [options]

```

The package.json in the shell template project has scripts to handle this execution - for yarn, use `yarn update:project` command or npm  `npm run update:project` command.

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
    - package name length should be greater than zero
    - all the characters in the package name must be lowercase i.e., no uppercase or mixed case names are allowed
    - package name can consist of hyphens
    - package name must not contain any non-url-safe characters (since name ends up being part of a URL)
    - package name should not start with . or _
    - package name should not contain any leading or trailing spaces
    - package name should not contain any of the following characters: ~)('!*
    - package name length cannot exceed 214   

2. All argument names like projectName, menuOrientation etc are exactly the same as defined in project-config.json. Only exception is 'version'. To update version, you will need to use `ch5-shell-cli update:project --projectVersion "1.0.0"`

3. Pages / widgets can be added using the configuration file method. If there are newer pages / widgets in the config file (that do not exist in the project), then the new pages / widgets will be added. If the config file does not contain the pages / widgets defined in the project, then these pages will be deleted and cannot be restored. The configuration file values will override the project-config.json file in the project.

4. if a config file is used to update the project, a confirmation will be requested by the script for updating the project. You can pass --force to override the confirmation.

5. To access help, execute `ch5-shell-cli update:project --help`.


### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.