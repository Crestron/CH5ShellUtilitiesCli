# Create Project Components

To create a project, open command-prompt or terminal,  go to the folder where you want to create the project, and then execute the command `ch5-shell-cli create:project:components`.

## How to Use

```bash
Usage:
    ch5-shell-cli create:project:components [options]

```

To create a project along with components using CLI, follow the below procedure:
    Pass a configuration JSON file: This file is similar to project-config.json. The project can be created with customized content like 'selectedTheme', newer pages and widgets, etc.. The user will not be prompted for any further information, and all details will be picked from the json file.

`ch5-shell-cli create:project:components --config ./downloads/sample-config.json`

To access help, execute `ch5-shell-cli create:project:components --help`.

### Copyright

Copyright (C) 2022 to the present, Crestron Electronics, Inc.

All rights reserved.

No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.

Use of this source code is subject to the terms of the Crestron Software License Agreement
under which you licensed this source code.