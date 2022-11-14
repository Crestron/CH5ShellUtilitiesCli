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

1. Create Project

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

2. Update Project

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

### setup local
`npm run setup:local`

### install global ch5-shell-cli
install -g ch5-shell-cli

### Rename Archive

"rename:archive": `npx ch5-cli archive -p my-project-v1.0.0 --source-archive ./shell-template.ch5z -o ./ `

### How to use project-config.json

CH5 components are HTML components. The visual skin and other style of these components are controlled with CSS styles called themes.

The template comes with two prebuilt themes: light and dark. The light theme is used by default. To change between the prebuilt themes, set `selectedTheme` within `project‑config.json` to either `light-theme` or `dark-theme`.

"selectedTheme": "light-theme",

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
