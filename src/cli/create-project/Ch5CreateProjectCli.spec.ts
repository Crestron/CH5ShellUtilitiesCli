import { expect, assert } from 'chai';
import { Ch5CreateProjectCli } from './Ch5CreateProjectCli';
import * as sinon from "sinon";
import mock from 'mock-fs';
import { Ch5CliLogger } from "../Ch5CliLogger";
import { SinonStub } from "sinon";
import { run, UP, DOWN, ENTER, EXIT } from 'cli-mocker';
import { split } from 'ts-node';
const fs = require('fs');
const path = require('path');

describe.only('Create Project >>>>>>>> ', () => {

  describe('Functions >>>>>>>> ', () => {

    let createProjectCli: Ch5CreateProjectCli;
    let protoCreateProjectCli: any;
    let i18nJson: any;

    before(async () => {
      createProjectCli = new Ch5CreateProjectCli();
      protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
      i18nJson = await readI18nJson();
    });

    it('initialize()', () => {
      const expectedResult = {
        askConfirmation: false,
        result: false,
        errorMessage: "",
        warningMessage: "",
        successMessage: "",
        backupFolder: "",
        data: {
          updatedInputs: [],
          projectName: "",
          projectType: ""
        }
      };

      createProjectCli.initialize();
      assert.deepEqual(createProjectCli.getOutputResponse(), expectedResult);
    });

    it('containsSpecialCharsInPackageName()', async () => {
      const dataArray = [
        {
          "key": "AAAAA",
          "value": false
        },
        {
          "key": "BB@AAA",
          "value": true
        },
        {
          "key": "CCC_.",
          "value": false
        }
      ];
      for (let i = 0; i < dataArray.length; i++) {
        const output = protoCreateProjectCli.containsSpecialCharsInPackageName(dataArray[i].key);
        expect(output).to.equal(dataArray[i].value);
      }
    });

    it('getCLIExecutionPath', async () => {
      const createProjectCli = new Ch5CreateProjectCli();
      const output = createProjectCli.getCLIExecutionPath();
      expect(output).to.equal(__dirname);
    });

  });

  describe('CLI Tests >>>>>>>> ', function () {
    let createProjectCli: Ch5CreateProjectCli;
    let protoCreateProjectCli: any;
    let i18nJson: any;
    // Calls to timeout are hierarchical. The problem is that beforeEach has no children. So we need to set timeout globally.
    this.timeout(10000);
    const DEFAULT_EXECUTION_PATH = path.resolve("./");

    before(async () => {
      createProjectCli = new Ch5CreateProjectCli();
      protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
      i18nJson = await readI18nJson();
    });

    this.beforeEach(async () => {
      process.chdir(DEFAULT_EXECUTION_PATH);
    });

    it('Help File', async () => {
      const { lastOutput } = await run('ch5-shell-cli create:project -h', []);
      const actualValue = await fs.readFileSync("./src/cli/create-project/files/help.txt", "utf-8");
      // Reason to have.string is because the lastOutput starts with dynamically created options in the help output
      expect(String(lastOutput)).to.have.string(String(actualValue));
    });

    it('Create: Case 1', async function () {
      const output = await createProject("Case1", "shell-template");
      // Reason to have.string is because the lastOutput will contain color coding for message
      expect(String(output.actual)).to.have.string(output.expected);
    });

    it('Create: Case 2', async function () {
      const output = await createProject("Case2", "abc123");
      // Reason to have.string is because the lastOutput will contain color coding for message
      expect(String(output.actual)).to.have.string(output.expected);
    });

    async function createProject(createInFolderName: string, projectName: string) {
      const pathToExecute = await changeDirectory(createInFolderName);
      process.chdir(pathToExecute);
      const { lastOutput } = await run('ch5-shell-cli create:project --projectName ' + projectName, []);
      const expectedResponse = createProjectCli.getText("LOG_OUTPUT.SUCCESS_MESSAGE", projectName, protoCreateProjectCli.getCurrentWorkingDirectory());
      return { expected: expectedResponse, actual: lastOutput };
    }

  });

});


async function createFolderForProjectCreation(directoryName: string) {
  directoryName = replaceAll(directoryName, "\"", "/");
  const directories = directoryName.split("/");
  let currentDirectory = "./";
  for (let i = 0; i < directories.length; i++) {
    currentDirectory += directories[i] + "/";
    await run('mkdir ' + path.resolve(currentDirectory), []);
    await run('cd ' + path.resolve(currentDirectory), []);
  }
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

async function changeDirectory(directoryName: string) {
  const fullDirectory = 'build/automation-tests/' + directoryName;
  await createFolderForProjectCreation(fullDirectory);
  return path.resolve("./" + fullDirectory);
}

async function readI18nJson() {
  const data = await fs.readFileSync(path.resolve("./src/cli/create-project/i18n/en.json"));
  return JSON.parse(data);
}
// describe('Create Project >>>>>>>> ', () => {

//   const createProject = new Ch5CreateProjectCli();

//   before(function(done) {
//     this.timeout(30000); // A very long environment setup.
//     setTimeout(done, 2500);
//   });

//   after(() => {

//   });

//   beforeEach(() => {

//   });

//   afterEach(() => {
//     // Revert any stubs / mocks created using sinon

//   });

//   describe('Test Functions >>>>>>>> ', () => {

//     it('Expect to fail if page name already exists in project-config', () => {
//       const response = createProject.getCLIExecutionPath();
//       expect(response).to.equal(__dirname);
//     });

//   });

//   describe('Test Workflow >>>>>>>> ', () => {

//     it('Check Initial Constructor response', async (done) => {
//       // const createProject = new Ch5CreateProjectCli();
//       await createProject.initialize();
//       const response = createProject.getOutputResponse();
//       // console.log(response);
//       expect(response).to.equal(__dirname);
//       done();
//     });

//   });

// });
