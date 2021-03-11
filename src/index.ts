#!/usr/bin/env node

// // Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// // All rights reserved.
// // No part of this software may be reproduced in any form, machine
// // or natural, without the express written consent of Crestron Electronics.
// // Use of this source code is subject to the terms of the Crestron Software License Agreement
// // under which you licensed this source code.

import { Ch5ShellCli } from "./cli";

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');

const cli = new Ch5ShellCli();
cli.run();
// clear();
// console.log(
//   chalk.red(
//     figlet.textSync('crestron-shell-cli', { horizontalLayout: 'full' })
//   )
// );

// program
//   .version('0.0.1')
//   .description("An example CLI for ordering pizza's")
//   .option('-p, --peppers', 'Add peppers')
//   .option('-P, --pineapple', 'Add pineapple')
//   .option('-b, --bbq', 'Add bbq sauce')
//   .option('-c, --cheese <type>', 'Add the specified type of cheese [marble]')
//   .option('-C, --no-cheese', 'You do not want any cheese')
//   .parse(process.argv);

//   console.log("process args", process.argv);