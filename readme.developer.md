# CH5 Utilities CLI

> Archiving and distribution utilities from the ch5-utilities library wrapped as CLI commands.

## Table of Contents

- [Background](#background)
- [Setup](#setup)
- [Commands](#commands)
- [Usage](#usage)
- [License](#license)

## Background

The purpose of the library is to expose the [ch5-utilities](./../ch5-utilities/readme.md) archive and distribute functionality as two commands: `archive` and `deploy`.

## Setup

Before going through these steps, make sure you have completed the setup section in [ch5-utilities](./../ch5-utilities/readme.md), since it is a dependency.

Install the required packages.
```
yarn install
```

Add the ch5-utilities library.
```
yarn link ch5-utilities
```

Build the library.
```
yarn build
```

Publish the ch5-utilities-cli library for local usage.
```
yarn link
```

## Commands

#### yarn publish:local

After the initial setup, you can use this command to rebuild and publish changes in the library.

## Usage

The cli contains two commands: archive and deploy. After following the steps from above, just write `ch5-cli` in the terminal, and hit enter - it will display the default message for options and commands.
For details about how to use the commands, you can write `ch5-cli archive --help` or `ch5-cli deploy --help` - this will display the options and what they mean.


First you would need to run the archive command to generate the ch5z file, then you need to run the deploy command giving the archive path ( relative or absolute ).
The deploy command will prompt you for the SFTP user and password,

#### Examples

```
> ch5-cli archive --project-name angular-demo-app --directory-name dist/NgIseCh5Demo --output-directory output-test
>
>
> ch5-cli deploy output-test/angular-demo-app.ch5z --deviceHost 192.168.2.44 --deviceDirectory display --deviceType touchscreen
```

## License

Copyright (C) 2018 to the present, Crestron Electronics, Inc.
All rights reserved.
No part of this software may be reproduced in any form, machine
or natural, without the express written consent of Crestron Electronics.
Use of this source code is subject to the terms of the Crestron Software 
Development Tools License Agreement under which you licensed this source code.

If you did not accept the terms of the license agreement,
you are not authorized to use this software. For the terms of the license,
please see the license agreement between you and Crestron at http://www.crestron.com/sla.
