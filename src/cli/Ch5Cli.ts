// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import commander from "commander";
import chalk from 'chalk';

import { Ch5GeneratePageCli } from "./generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "./generate-widget/Ch5GenerateWidgetCli";

const clear = require('clear');
const figlet = require('figlet');
const packageJson = require('../../package.json');
const buildVersion = packageJson.version || 'VERSION_NOT_READ';

export class Ch5ShellCli {
  private readonly generatePage: Ch5GeneratePageCli;
  private readonly generateWidget: Ch5GenerateWidgetCli;

  public constructor() {
    this.generatePage = new Ch5GeneratePageCli();
    this.generateWidget = new Ch5GenerateWidgetCli();
  }

  public async run(): Promise<void> {
    const program = new commander.Command();
    program
      .version(buildVersion)
      .description("CH5 Shell Utilities CLI");

    // clear();
    console.log(
      chalk.red(
        figlet.textSync('crestron-shell-cli', { horizontalLayout: 'full' })
      )
    );
    
  await  this.generatePage.setupCommand(program);
    this.generateWidget.setupCommand(program);

    // error on unknown commands
    program.on('command:*', function () {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
      process.exit(1);
    });

    program.parse(process.argv);

    // if (!process.argv.slice(2).length) {
    //   clear();
    //   console.log(
    //     chalk.blue(
    //       figlet.textSync(`Crestron CH5 Utilities © ${new Date().getFullYear()}`,
    //         {
    //           font: 'Standard',
    //           horizontalLayout: 'full',
    //           verticalLayout: 'full'
    //         })
    //     )
    //   );
    //   program.outputHelp();
    // }
  }
}
