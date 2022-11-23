# CH5 Shell Utilities CLI

> Archiving and distribution utilities from the ch5-utilities library wrapped as CLI commands.

## Table of Contents

- [Background](#background)
- [Setup](#setup)
- [Commands](#commands)
- [Usage](#usage)
- [License](#license)

## Background

The purpose of the library is to expose the [ch5-shell-utilities](https://github.com/Crestron/CH5ShellUtilitiesCli) archive and distribute functionality.

## Setup

Build the library.
```
npm run build
```

Publish the ch5-shell-utilities-cli library for local usage.
```
npm link
```

## Commands

### npm run publish:local

After the initial setup, you can use this command to rebuild and publish changes in the library.

## Developer

### Testing Scripts

Please replace ${USERNAME} with your username on /Users/${USERNAME}/Downloads. This path should work for Windows and Mac.

1. Create Project

1.1. Page-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

1.2. Widget-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

2. Update Project

2.1. Page-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

2.2. Widget-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

### setup local
`npm run setup:local`

### Rename Archive

"rename:archive": `npx ch5-cli archive -p my-project-v1.0.0 -d ./ -o /Users/mruanova-hurtado/git/CH5ShellUtilitiesCli/src/shell/dist/prod -s shell-template.ch5z`,

project name is optional, if not provided then it will read the name in the package JSON file

"rename:archive": `npx ch5-cli archive -d ./ -o /Users/mruanova-hurtado/git/CH5ShellUtilitiesCli/src/shell/dist/prod -s shell-template.ch5z`

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
