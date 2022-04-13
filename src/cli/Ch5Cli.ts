// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import commander from "commander";

import { Ch5GeneratePageCli } from "./generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "./generate-widget/Ch5GenerateWidgetCli";
import { Ch5ExportProjectCli } from "./export-project/Ch5ExportProjectCli";
import { Ch5DeleteComponentsCli } from "./delete-components/Ch5DeleteComponentsCli";
import { Ch5ExportAllCli } from "./export-all/Ch5ExportAllCli";
import { Ch5ExportLibrariesCli } from "./export-libraries/Ch5ExportLibrariesCli";
import { Ch5ExportAssetsCli } from "./export-assets/Ch5ExportAssetsCli";
import { Ch5ExportComponentsCli } from "./export-components/Ch5ExportComponentsCli";
import { Ch5ImportAssetsCli } from "./import-assets/Ch5ImportAssetsCli";
import { Ch5ImportLibrariesCli } from "./import-libraries/Ch5ImportLibrariesCli";
import { Ch5ImportComponentsCli } from "./import-components/Ch5ImportComponentsCli";
import { Ch5ImportAllCli } from "./import-all/Ch5ImportAllCli";
import { Ch5ValidateProjectConfigCli } from "./validate-project-config/Ch5ValidateProjectConfigJsonCli";
import { Ch5UpdateProjectCli } from "./update-project/Ch5UpdateProjectCli";
import { Ch5CreateProjectCli } from "./create-project/Ch5CreateProjectCli";
import { Ch5CreateProjectCliCustom } from "./create-project-components/Ch5CreateProjectCliComponents";
import { Ch5UpgradeProjectCli } from "./upgrade-project/Ch5UpgradeProjectCli";

const packageJson = require('../../package.json');
const buildVersion = packageJson.version || 'VERSION_NOT_READ';

export class Ch5ShellCli {
  private readonly createProject: Ch5CreateProjectCli;
  private readonly createProjectCustom: Ch5CreateProjectCliCustom;
  private readonly deleteComponents: Ch5DeleteComponentsCli;
  private readonly exportAll: Ch5ExportAllCli;
  private readonly exportAssets: Ch5ExportAssetsCli;
  private readonly exportComponents: Ch5ExportComponentsCli;
  private readonly exportLibraries: Ch5ExportLibrariesCli;
  private readonly exportProject: Ch5ExportProjectCli;
  private readonly generatePage: Ch5GeneratePageCli;
  private readonly generateWidget: Ch5GenerateWidgetCli;
  private readonly importAll: Ch5ImportAllCli;
  private readonly importAssets: Ch5ImportAssetsCli;
  private readonly importComponents: Ch5ImportComponentsCli;
  private readonly importLibraries: Ch5ImportLibrariesCli;
  private readonly updateProject: Ch5UpdateProjectCli;
  private readonly upgradeProject: Ch5UpgradeProjectCli;
  private readonly validateProjectConfig: Ch5ValidateProjectConfigCli;

  public constructor() {
    this.createProject = new Ch5CreateProjectCli();
    this.createProjectCustom = new Ch5CreateProjectCliCustom();
    this.deleteComponents = new Ch5DeleteComponentsCli();
    this.exportAll = new Ch5ExportAllCli();
    this.exportAssets = new Ch5ExportAssetsCli();
    this.exportComponents = new Ch5ExportComponentsCli();
    this.exportLibraries = new Ch5ExportLibrariesCli();
    this.exportProject = new Ch5ExportProjectCli();
    this.generatePage = new Ch5GeneratePageCli();
    this.generateWidget = new Ch5GenerateWidgetCli();
    this.importAll = new Ch5ImportAllCli();
    this.importAssets = new Ch5ImportAssetsCli();
    this.importComponents = new Ch5ImportComponentsCli();
    this.importLibraries = new Ch5ImportLibrariesCli();
    this.updateProject = new Ch5UpdateProjectCli();
    this.upgradeProject = new Ch5UpgradeProjectCli();
    this.validateProjectConfig = new Ch5ValidateProjectConfigCli();
  }

  public async run(): Promise<void> {
    const program = new commander.Command();
    program
      .version(buildVersion)
      .description("CH5 Shell Utilities CLI");

    // This adds a nice fancy ch5-shell-cli in console whenever a command is executed.
    // console.log(
    //   chalk.greenBright(
    //     figlet.textSync('ch5-shell-cli', { horizontalLayout: 'controlled smushing' })
    //   )
    // );

    await this.createProject.setupCommand(program);
    await this.createProjectCustom.setupCommand(program);
    await this.deleteComponents.setupCommand(program);
    await this.exportAll.setupCommand(program);
    await this.exportAssets.setupCommand(program);
    await this.exportComponents.setupCommand(program);
    await this.exportLibraries.setupCommand(program);
    await this.exportProject.setupCommand(program);
    await this.generatePage.setupCommand(program);
    await this.generateWidget.setupCommand(program);
    await this.importAll.setupCommand(program);
    await this.importAssets.setupCommand(program);
    await this.importComponents.setupCommand(program);
    await this.importLibraries.setupCommand(program);
    await this.updateProject.setupCommand(program);
    await this.upgradeProject.setupCommand(program);
    await this.validateProjectConfig.setupCommand(program);

    // error on unknown command
    program.on('command:*', function () {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
      process.exit(1);
    });

    program.parse(process.argv);
  }
}
