// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliNew } from "../Ch5BaseClassForCliNew";
import { Ch5CliProjectConfig } from '../Ch5CliProjectConfig';
import { ICh5CliNew } from "../ICh5Cli";

const https = require('https');
const zl = require("zip-lib");
const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const editJsonFile = require("edit-json-file");

export class Ch5UpgradeProjectCli extends Ch5BaseClassForCliNew implements ICh5CliNew {
	private readonly SHELL_FOLDER: string = path.normalize(path.join(__dirname, "../../", "shell"));
	private readonly PROJECT_CONFIG_JSON_PATH: string = path.normalize("/app/project-config.json");
	private readonly cliProjectConfig: Ch5CliProjectConfig;

	private readonly temporaryPath = './temp';
	private readonly node_modules = './node_modules';
	private readonly templatePath = './app/template';
	private readonly assetsPath = './app/project/assets';
	private readonly contractPath = './config/contract.cse2j';
	private readonly vscodePath = './.vscode';
	private readonly licensePath = './LICENSE.txt';
	private readonly copyrightPath = './copyright.txt';
	private readonly packagePath = './package.json';
	private readonly readmePath = './README.md';
	private readonly packageLockPath = './package-lock.json';
	private readonly appConfigPath = './app.config.js';
	private readonly webpackCommonPath = './webpack.common.js';
	private readonly webpackDevPath = './webpack.dev.js';
	private readonly webpackProdPath = './webpack.prod.js';
	private readonly indexHtmlPath = './app/index.html';
	private readonly oldShellUtilitiesPath = './shell-utilities';

	/**
	 * Constructor
	 */
	public constructor(public showOutputMessages: boolean = true) {
		super("upgrade-project");
		this.cliProjectConfig = new Ch5CliProjectConfig();
	}

	/**
	 * Implement this component's main purpose
	 */
	async processRequest() {
		this.logger.start("processRequest");

		try {
			// STEP 1: Update new project-config.json
			this.processThemesDifferences();

			this.processHeaderDifferences();

			this.processPagesDifferences();
			// STEP 2: update directories

			await this.processDirectories();
			this.logger.printSuccess(this.getText('SUCCESS_MESSAGE'));
		} catch (err: any) {
			if (err.message.toLowerCase().includes('no such file')) {
				this.logger.printWarning(this.getText("INVALID_STRUCTURE.MISSING_FILE"));
			} else if (err.message.toLowerCase().includes('operation not permitted')) {
				this.logger.printWarning(this.getText("INVALID_STRUCTURE.INVALID_PERMISSIONS"));
			}
		}

		this.logger.end();
	}

	processDirectoriesOld() {
		return new Promise((resolve, reject) => {
			const v2URL = 'https://siproducts.blob.core.windows.net/ch5-test/05042022/Ch5ShellTemplate-2.0.26-alpha.27.zip';
			https.get(v2URL, (res: any) => {
				// create temporary folder
				fs.mkdirSync(`${this.temporaryPath}`);
				const filePath = fs.createWriteStream(`${this.temporaryPath}/v2.zip`);
				res.pipe(filePath);
				filePath.on('finish', () => {
					// download file to V2.zip
					filePath.close();
					// extract v2.zip to v2
					zl.extract(`${this.temporaryPath}/v2.zip`, `${this.temporaryPath}/v2`).then(async () => {
						try {
							this.processCode();
							resolve(true);
						} catch (err) {
							reject(err);
						}
					}, (err: any) => {
						reject(err);
					});
				})
			})
		})
	}

	processDirectories() {
		const pathForV2 = path.resolve(path.join(this.temporaryPath, "v2"));
		this.logger.log("pathForV2", pathForV2);
		// create temporary folder
		try {
			fs.mkdirSync(pathForV2, { recursive: true });
			// Move v2 to temporary path
			fsExtra.copySync(this.SHELL_FOLDER, pathForV2);
			// Reason for below: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json
			fs.renameSync(path.resolve(path.join(pathForV2, "packagelock.json")), path.resolve(path.join(pathForV2, "package-lock.json")));

			this.processCode();
		} catch (e: any) {
			this.logger.printError(e);
			throw new Error(e);
		}
	}

	processCode() {
		try {
			// delete node_modules
			this.utils.deleteFolder(this.node_modules);

			// delete old template from v1
			this.utils.deleteFolder(this.templatePath);
			// delete old assets folder from project
			// this.utils.deleteFolder(this.assetsPath);
			// delete old contract
			// this.utils.deleteFile(this.contractPath);
			// delete old vscode path
			this.utils.deleteFolder(this.vscodePath);
			// delete old shell utilities
			this.utils.deleteFolder(this.oldShellUtilitiesPath);
			// copy new template from v2
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.templatePath)), this.templatePath);
			// copy assets from v2 to v1
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.assetsPath)), this.assetsPath);
			// copy new contract
			// fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.contractPath)), this.contractPath);
			// copy new vscode
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.vscodePath)), this.vscodePath);
			// copy license
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.licensePath)), this.licensePath);
			// copy copyright
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.copyrightPath)), this.copyrightPath);
			// copy readme
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.readmePath)), this.readmePath);
			// copy package lock
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.packageLockPath)), this.packageLockPath);
			// copy app.config
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.appConfigPath)), this.appConfigPath);
			// copy webpack common
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.webpackCommonPath)), this.webpackCommonPath);
			// copy webpack dev 
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.webpackDevPath)), this.webpackDevPath);
			// copy webpack prod
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.webpackProdPath)), this.webpackProdPath);
			// copy index.html
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.indexHtmlPath)), this.indexHtmlPath);


			// copy package.json and keep old name from v1
			const oldPackageName = (fsExtra.readJSONSync(this.packagePath)).name;
			fsExtra.copySync(path.resolve(path.join(this.temporaryPath, "v2", this.packagePath)), this.packagePath);
			const packageFile = editJsonFile(this.packagePath);
			packageFile.set('name', oldPackageName);
			packageFile.save();
		} catch (e: any) {
			throw new Error(e);
		}
	}

	processThemesDifferences() {
		const oldThemes = this.cliProjectConfig.getAllThemes();

		for (const oldTheme of oldThemes) {
			oldTheme.extends = oldTheme.name;
		}

		this.cliProjectConfig.saveOverrideAttributeToJSON('themes', oldThemes);
	}

	processHeaderDifferences() {
		const oldHeader = this.cliProjectConfig.getJson().header;

		this.cliProjectConfig.saveOverrideAttributeToJSON('header', {
			...oldHeader,
			diagnostics: {
				logs: {
					logAfterProjectLoad: true,
					receiveStateLogDiagnostics: "",
					logDiagnostics: "none"
				}
			},
		})
	}

	processPagesDifferences() {
		const oldPages = this.cliProjectConfig.getJson().content.pages;

		for (const oldPage of oldPages) {
			oldPage.cachePage = false;
			oldPage.preloadPage = false;
			delete oldPage.pageProperties;
		}

		this.cliProjectConfig.saveOverrideAttributeToJSON('content.pages', oldPages);

		const oldWidgets = this.cliProjectConfig.getJson().content.widgets;

		for (const oldWidget of oldWidgets) {
			delete oldWidget.widgetProperties;
		}

		this.cliProjectConfig.saveOverrideAttributeToJSON('content.widgets', oldWidgets);
	}

	/**
	 * Clean up
	 */
	async cleanUp() {
		setTimeout(() => {
			this.utils.deleteFolder(this.temporaryPath);
		}, 100);
	}
}
