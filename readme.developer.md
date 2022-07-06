# CH5 Shell Utilities CLI

> Archiving and distribution utilities from the ch5-utilities library wrapped as CLI commands.

## Table of Contents

- [Background](#background)
- [Setup](#setup)
- [Commands](#commands)
- [Usage](#usage)
- [License](#license)

## Background

The purpose of the library is to expose the [ch5-shell-utilities](./../ch5-shell-utilities/readme.md) archive and distribute functionality.

## Setup

Build the library.
```
yarn build
```

Publish the ch5-shell-utilities-cli library for local usage.
```
yarn link
```

## Commands

#### yarn publish:local

After the initial setup, you can use this command to rebuild and publish changes in the library.

## Developer

### Testing Scripts

1. create project

rm -rf * &&  ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. &&  mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/rdabbir/Downloads/tt/shell-template/app/project-config.json && cd ..

rm -rf * &&  ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. &&  mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/rdabbir/Downloads/tt/shell-template/app/project-config.json && cd ..

2. update project

rm -rf * &&  ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/rdabbir/Downloads/tt/shell-template/app/project-config.json && cd ..

rm -rf * &&  ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. &&  mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' &&  ch5-shell-cli update:project --config /Users/rdabbir/Downloads/tt/shell-template/app/project-config.json && cd ..

### How to use config.jso
## License

Copyright (C) 2022 to the present, Crestron Electronics, Inc.
All rights reserved.
No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.
Use of this source code is subject to the terms of the Crestron Software 
Development Tools License Agreement under which you licensed this source code.

If you did not accept the terms of the license agreement,
you are not authorized to use this software. For the terms of the license,
please see the license agreement between you and Crestron at http://www.crestron.com/sla.
