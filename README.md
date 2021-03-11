<p align="center">
  <img src="https://kenticoprod.azureedge.net/kenticoblob/crestron/media/crestron/generalsiteimages/crestron-logo.png">
</p>
 
# CH5 Utilities CLI - Getting Started

> Archiving and distribution utilities from the ch5-utilities library wrapped as CLI commands.

## Table of Contents

- [Background](#background)
- [Usage](#usage)
- [License](#license)

## Background

The purpose of the library is to expose the [ch5-utilities](https://www.npmjs.com/package/@crestron/ch5-utilities) archive and distribute functionality as two commands: `archive` and `deploy`.


## Usage

The cli contains two commands: archive and deploy. After following the steps from above, just write `ch5-cli` in the terminal, and hit enter - it will display the default message for options and commands.
For details about how to use the commands, you can write `ch5-cli archive --help` or `ch5-cli deploy --help` - this will display the options and what they mean.


First you would need to run the archive command to generate the ch5z file, then you need to run the deploy command giving the archive path ( relative or absolute ).

#### Examples

```
> ch5-cli archive -p ch5-template-sample -d dist/NgCh5DemoHorizontal -o dist
> ch5-cli deploy -H tshostname -t touchscreen dist/ch5-template-sample.ch5z
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
