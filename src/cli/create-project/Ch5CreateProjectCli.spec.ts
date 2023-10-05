import { expect, assert } from 'chai';
import { Ch5CreateProjectCli } from './Ch5CreateProjectCli';
import * as sinon from "sinon";
import mock from 'mock-fs';
import { Ch5CliLogger } from "../Ch5CliLogger";
import { SinonStub } from "sinon";
import { run, UP, DOWN, ENTER, EXIT } from 'cli-mocker';
import { split } from 'ts-node';
import { Ch5CliUtil } from '../Ch5CliUtil';
import { prepareEnvironment } from '@gmrchk/cli-testing-library';
import CLITestingLibary from '@gmrchk/cli-testing-library';
const fs = require('fs');
const path = require('path');
const dircompare = require('dir-compare');

const { exec } = require('child_process');

// describe.only('Create Project >>>>>>>> ', () => {
//   it('program runs successfully', async () => {
//     const { execute, cleanup } = await prepareEnvironment();
//     const { code, stdout, stderr } = await execute(
//       'ch5-shell-cli --help',
//       ''
//     );
//     console.log(code); // 0
//     console.log(stdout); // ["Hello world!"]
//     console.log(stderr); // []

//     expect(code).to.equal(0);

//     await cleanup();
//   });
// });

describe('Create Project >>>>>>>> ', () => {

  describe('Functions >>>>>>>> ', () => {

    let createProjectCli: Ch5CreateProjectCli;
    let protoCreateProjectCli: any;
    let i18nJson: any;

    before(async () => {
      createProjectCli = new Ch5CreateProjectCli();
      protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
      i18nJson = await readJSONFile("./src/cli/create-project/i18n/en.json");
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

  describe('Help (-h) >>>>>>>> ', function () {
    it('Help File', async () => {
      const { lastOutput } = await run('ch5-shell-cli create:project -h', []);
      const actualValue = await fs.readFileSync("./src/cli/create-project/files/help.txt", "utf-8");
      // Reason to have.string is because the lastOutput starts with dynamically created options in the help output
      expect(String(lastOutput)).to.have.string(String(actualValue));
    });
  });

  describe('Create Project Tests', function () {
    let createProjectCli: Ch5CreateProjectCli;
    let protoCreateProjectCli: any;
    let i18nJson: any;
    let configJson: any;
    let repoFolder: any;

    // Calls to timeout are hierarchical. The problem is that beforeEach has no children. So we need to set timeout globally.
    this.timeout(10000);
    const DEFAULT_EXECUTION_PATH = path.resolve("./");

    before(async () => {
      createProjectCli = new Ch5CreateProjectCli();
      protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
      i18nJson = await readJSONFile("./src/cli/create-project/i18n/en.json");
      configJson = await readJSONFile("./src/cli/create-project/files/config.json");
      repoFolder = path.resolve("./");
    });

    describe.only('Create Project - Negative Tests ', function () {
      this.beforeEach(async () => {
        process.chdir(DEFAULT_EXECUTION_PATH);
      });

      exec('ch5-shell-cli create:project --projectName', (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }

        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        console.log(`stdout:\n${stdout}`);
      });

      // spawn('ch5-shell-cli create:project', ['--projectName', '#abcd'])
      //   .then(function(result: any){
      //     console.log("result", result);
      //     // command was executed
      //     // write tests here
      //   })
      //   .fail(function(err: any){
      //     console.log("failure", err);
      //     // maybe 1 last test to make sure there was no test
      //   });
    });

    describe('Create Project - Positive Tests ', function () {
      this.beforeEach(async () => {
        process.chdir(DEFAULT_EXECUTION_PATH);
      });

      const positiveCases = getAllPositiveTestCases();
      for (let i = 0; i < positiveCases.length; i++) {
        it('Create: Positive Case ' + i + ": " + JSON.stringify(positiveCases[i]), async function () {
          const output = await createProject("PositiveCase" + i, positiveCases[i]);
          // Reason to have.string is because the lastOutput will contain color coding for message
          expect(String(output.actual)).to.have.string(output.expected);

          // Read package.json for projectName
          const packageJSON: any = await readJSONFile(output.pathToExecute, output.projectName, "package.json");
          expect(String(packageJSON.name)).to.equal(output.projectName);

          // Read project-config.json
          const projectConfig: any = await readJSONFile(output.pathToExecute, output.projectName, "app", "project-config.json");
          expect(String(projectConfig.projectName)).to.equal(output.projectName);
          expect(String(projectConfig.projectType)).to.equal(output.projectType);
          expect(projectConfig.forceDeviceXPanel).to.equal(output.forceDeviceXPanel);

          // Check for availability of files as per template
          const pathForTemplate: any = configJson.custom.templates[output.projectType];
          for (let j = 0; j < pathForTemplate.customFolders.length; j++) {
            const path1 = path.resolve(repoFolder, "./src/project-templates/" + output.projectType + "/" + pathForTemplate.customFolders[j]);
            const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFolders[j]);
            const responseDirCompare = dircompare.compareSync(path1, path2);
            expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
          }
          for (let j = 0; j < pathForTemplate.customFiles.length; j++) {
            if (pathForTemplate.customFiles[j] !== "package.json") {
              const path1 = path.resolve(repoFolder, "./src/shell/" + pathForTemplate.customFiles[j]);
              const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFiles[j]);
              const responseDirCompare = dircompare.compareSync(path1, path2);
              expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
            }
          }

          // Run val:pc
        });
      }
    });

    describe('Create Project - Invalid ProjectType ', function () {
      this.beforeEach(async () => {
        process.chdir(DEFAULT_EXECUTION_PATH);
      });

      const invalidProjectTypeCases = getInvalidProjectTypeCases();
      for (let i = 0; i < invalidProjectTypeCases.length; i++) {
        it('Create: Invalid Project Type Case ' + i + ": " + JSON.stringify(invalidProjectTypeCases[i]), async function () {
          const output = await createProject("invalidProjectTypeCase" + i, invalidProjectTypeCases[i]);
          // Reason to have.string is because the lastOutput will contain color coding for message
          expect(String(output.actual)).to.have.string(output.expected);

          // Read package.json for projectName
          const packageJSON: any = await readJSONFile(output.pathToExecute, output.projectName, "package.json");
          expect(String(packageJSON.name)).to.equal(output.projectName);

          // Read project-config.json
          const projectConfig: any = await readJSONFile(output.pathToExecute, output.projectName, "app", "project-config.json");
          expect(String(projectConfig.projectName)).to.equal(output.projectName);
          expect(String(projectConfig.projectType)).to.equal(output.projectType);
          expect(projectConfig.forceDeviceXPanel).to.equal(output.forceDeviceXPanel);

          // Check for availability of files as per template
          const pathForTemplate: any = configJson.custom.templates[output.projectType];
          for (let j = 0; j < pathForTemplate.customFolders.length; j++) {
            const path1 = path.resolve(repoFolder, "./src/project-templates/" + output.projectType + "/" + pathForTemplate.customFolders[j]);
            const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFolders[j]);
            const responseDirCompare = dircompare.compareSync(path1, path2);
            expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
          }
          for (let j = 0; j < pathForTemplate.customFiles.length; j++) {
            if (pathForTemplate.customFiles[j] !== "package.json") {
              const path1 = path.resolve(repoFolder, "./src/shell/" + pathForTemplate.customFiles[j]);
              const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFiles[j]);
              const responseDirCompare = dircompare.compareSync(path1, path2);
              expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
            }
          }

          // Run val:pc
        });
      }
    });

    describe('Create Project - Invalid ForceDeviceXPanel ', function () {

      this.beforeEach(async () => {
        process.chdir(DEFAULT_EXECUTION_PATH);
      });

      const invalidForceDeviceXPanelCases = getInvalidForceDeviceXPanelCases();
      for (let i = 0; i < invalidForceDeviceXPanelCases.length; i++) {
        it('Create: Invalid Force Device XPanel Case ' + i + ": " + JSON.stringify(invalidForceDeviceXPanelCases[i]), async function () {
          const output = await createProject("invalidForceDeviceXPanelCase" + i, invalidForceDeviceXPanelCases[i]);
          // Reason to have.string is because the lastOutput will contain color coding for message
          expect(String(output.actual)).to.have.string(output.expected);

          // Read package.json for projectName
          const packageJSON: any = await readJSONFile(output.pathToExecute, output.projectName, "package.json");
          expect(String(packageJSON.name)).to.equal(output.projectName);

          // Read project-config.json
          const projectConfig: any = await readJSONFile(output.pathToExecute, output.projectName, "app", "project-config.json");
          expect(String(projectConfig.projectName)).to.equal(output.projectName);
          expect(String(projectConfig.projectType)).to.equal(output.projectType);
          expect(projectConfig.forceDeviceXPanel).to.equal(output.forceDeviceXPanel);

          // Check for availability of files as per template
          const pathForTemplate: any = configJson.custom.templates[output.projectType];
          for (let j = 0; j < pathForTemplate.customFolders.length; j++) {
            const path1 = path.resolve(repoFolder, "./src/project-templates/" + output.projectType + "/" + pathForTemplate.customFolders[j]);
            const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFolders[j]);
            const responseDirCompare = dircompare.compareSync(path1, path2);
            expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
          }
          for (let j = 0; j < pathForTemplate.customFiles.length; j++) {
            if (pathForTemplate.customFiles[j] !== "package.json") {
              const path1 = path.resolve(repoFolder, "./src/shell/" + pathForTemplate.customFiles[j]);
              const path2 = path.resolve(output.pathToExecute + '/' + output.projectName + '/' + pathForTemplate.customFiles[j]);
              const responseDirCompare = dircompare.compareSync(path1, path2);
              expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
            }
          }

          // Run val:pc
        });
      }

    });

    async function createProject(createInFolderName: string, args: any[]) {
      const pathToExecute = await changeDirectory(createInFolderName);
      process.chdir(pathToExecute);
      let argumentString = "";
      let projectName = "";
      let projectType = "";
      let forceDeviceXPanel: string | boolean = "";

      for (let i = 0; i < args.length; i++) {
        argumentString += "--" + args[i].key + " " + args[i].value + " ";
        if (args[i].key.toLowerCase() === "projectname") {
          projectName = args[i].value;
        } else if (args[i].key.toLowerCase() === "projecttype") {
          projectType = args[i].value;
        } else if (args[i].key.toLowerCase() === "forcedevicexpanel") {
          if ((['true', 'Y', 'y']).includes(args[i].value)) {
            forceDeviceXPanel = true;
          } else if ((['false', 'N', 'n']).includes(args[i].value)) {
            forceDeviceXPanel = false;
          }
        }
      }

      if (!projectType || projectType === "" || (projectType.toLowerCase() !== "shell-template" && projectType.toLowerCase() !== "zoomroomcontrol")) {
        projectType = "shell-template";
      }
      projectType = projectType.toLowerCase();
      if (projectType === "zoomroomcontrol") {
        forceDeviceXPanel = true;
      } else {
        if (!forceDeviceXPanel || forceDeviceXPanel === "") {
          forceDeviceXPanel = false;
        } else {
          forceDeviceXPanel = Boolean(forceDeviceXPanel);
        }
      }

      const { lastOutput } = await run('ch5-shell-cli create:project ' + argumentString, []);
      const expectedResponse = createProjectCli.getText("LOG_OUTPUT.SUCCESS_MESSAGE", projectName, protoCreateProjectCli.getCurrentWorkingDirectory());
      return { expected: expectedResponse, actual: lastOutput, pathToExecute, projectName, projectType: projectType.toLowerCase(), forceDeviceXPanel };
    }

  });

});

function getInvalidProjectTypeCases() {
  const validProjectNames = ["shell-template"];
  const inValidProjectTypes = ["", null, undefined, "JUNK"];
  const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

  const validProjectTypeCases: any[] = [];
  for (let j = 0; j < inValidProjectTypes.length; j++) {
    const projType = { "key": "projectType", "value": inValidProjectTypes[j] };
    const projTypeArray: any[] = [];
    projTypeArray.push(JSON.parse(JSON.stringify(projType)));
    validProjectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
  }

  const validForceDeviceXPanelCases: any[] = [];
  for (let k = 0; k < validForceDeviceXPanel.length; k++) {
    const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
    const xPanelTypeArray: any[] = [];
    xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
    validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

    for (let i = 0; i < validProjectTypeCases.length; i++) {
      const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectTypeCases[i]));
      tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
      validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
    }
  }

  const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validForceDeviceXPanelCases)));
  const fullSetOfCases: any[] = [];
  for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
    for (let j = 0; j < validProjectNames.length; j++) {
      const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
      const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
      temporaryArray.push(JSON.parse(JSON.stringify(projName)));
      fullSetOfCases.push(JSON.parse(JSON.stringify(temporaryArray)));
    }
  }

  return fullSetOfCases;
}

function getInvalidForceDeviceXPanelCases() {
  const validProjectNames = ["shell-template"];
  const validProjectTypes = ["shell-template", "zoomroomcontrol"];
  const invalidForceDeviceXPanel = ["A", "1", "0", 1, 0, null, "", undefined];

  const projectTypeCases: any[] = [];
  for (let j = 0; j < validProjectTypes.length; j++) {
    const projType = { "key": "projectType", "value": validProjectTypes[j] };
    const projTypeArray: any[] = [];
    projTypeArray.push(JSON.parse(JSON.stringify(projType)));
    projectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
  }

  const forceDeviceXPanelCases: any[] = [];
  for (let k = 0; k < invalidForceDeviceXPanel.length; k++) {
    const xPanelType = { "key": "forceDeviceXPanel", "value": invalidForceDeviceXPanel[k] };
    const xPanelTypeArray: any[] = [];
    xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
    forceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

    for (let i = 0; i < projectTypeCases.length; i++) {
      const tempProjNameArray: any[] = JSON.parse(JSON.stringify(projectTypeCases[i]));
      tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
      forceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
    }
  }

  const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(projectTypeCases.concat(forceDeviceXPanelCases)));
  const fullSetOfCases: any[] = [];
  for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
    for (let j = 0; j < validProjectNames.length; j++) {
      const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
      const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
      temporaryArray.push(JSON.parse(JSON.stringify(projName)));
      fullSetOfCases.push(JSON.parse(JSON.stringify(temporaryArray)));
    }
  }

  return fullSetOfCases;
}

function getAllPositiveTestCases() {
  const validProjectNames = ["shell-template", "abc123", "b@", "c#", "d$", "a[", "a]", "a|", "a:", "a;", "a'", "a>", "a<", "a,",
    ".a", "@b", "#c", "$d", "%e", "^a", "&a", "*a", "(a", ")a", "!a", "~a", "`a", "-a", "_a", "=a", "+a", "{a", "}a", "[a", "]a", "|a", ":a", ";a", "'a", ">a", "<a", ",a", "a.b", "b@b", "c#b", "d$b", "e%b", "a^b", "a&b", "a*b", "a(b", "a)b", "a!b", "a~b", "a`b", "a-b", "a_b", "a=b", "a+b", "a{b", "a}b", "a[b", "a]b", "a|b", "a:b", "a;b", "a'b", "a>b", "a<b", "a,b"];
  const validProjectTypes = ["shell-template", "ZoomRoomControl", "zoomroomcontrol"];
  const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

  // const positiveCases1: any[] = [];
  // for (let i = 0; i < validProjectNames.length; i++) {
  //   const projName = { "key": "projectName", "value": validProjectNames[i] };
  //   const projNameArray: any[] = [];
  //   projNameArray.push(projName);
  //   positiveCases1.push(JSON.parse(JSON.stringify(projNameArray)));

  //   for (let j = 0; j < validProjectTypes.length; j++) {
  //     const projType = { "key": "projectType", "value": validProjectTypes[j] };
  //     const projTypeArray: any[] = [];
  //     projTypeArray.push(projType);
  //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

  //     projTypeArray.push(projName);
  //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

  //     for (let k = 0; k < validForceDeviceXPanel.length; k++) {
  //       const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
  //       const xPanelTypeArray: any[] = [];
  //       xPanelTypeArray.push(xPanelType);
  //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
  //       xPanelTypeArray.push(projName);
  //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
  //       xPanelTypeArray.push(projType);
  //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));   
  //     }
  //   }
  // }

  // const validProjectNameCases: any[] = [];
  // for (let i = 0; i < validProjectNames.length; i++) {
  //   const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[i])) };
  //   const projNameArray: any[] = [];
  //   projNameArray.push(JSON.parse(JSON.stringify(projName)));
  //   validProjectNameCases.push(JSON.parse(JSON.stringify(projNameArray)));
  // }

  const validProjectTypeCases: any[] = [];
  for (let j = 0; j < validProjectTypes.length; j++) {
    const projType = { "key": "projectType", "value": validProjectTypes[j] };
    const projTypeArray: any[] = [];
    projTypeArray.push(JSON.parse(JSON.stringify(projType)));
    validProjectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
  }

  const validForceDeviceXPanelCases: any[] = [];
  for (let k = 0; k < validForceDeviceXPanel.length; k++) {
    const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
    const xPanelTypeArray: any[] = [];
    xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
    validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

    for (let i = 0; i < validProjectTypeCases.length; i++) {
      const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectTypeCases[i]));
      tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
      validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
    }
  }

  const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validForceDeviceXPanelCases)));
  const positiveCases: any[] = [];
  for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
    for (let j = 0; j < validProjectNames.length; j++) {
      const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
      const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
      temporaryArray.push(JSON.parse(JSON.stringify(projName)));
      positiveCases.push(JSON.parse(JSON.stringify(temporaryArray)));
    }
  }

  // console.log("positiveCases (" + positiveCases.length + "): ", JSON.parse(JSON.stringify(positiveCases)));
  return positiveCases;
}

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

async function readJSONFile(...pathName: any) {
  const data = await fs.readFileSync(path.resolve(path.join(...pathName)));
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


/*

 const validProjectNames = ["shell-template", "abc123"];
    const validProjectTypes = ["shell-template", "ZoomRoomControl", "zoomroomcontrol"];
    const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

    // const positiveCases1: any[] = [];
    // for (let i = 0; i < validProjectNames.length; i++) {
    //   const projName = { "key": "projectName", "value": validProjectNames[i] };
    //   const projNameArray: any[] = [];
    //   projNameArray.push(projName);
    //   positiveCases1.push(JSON.parse(JSON.stringify(projNameArray)));

    //   for (let j = 0; j < validProjectTypes.length; j++) {
    //     const projType = { "key": "projectType", "value": validProjectTypes[j] };
    //     const projTypeArray: any[] = [];
    //     projTypeArray.push(projType);
    //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

    //     projTypeArray.push(projName);
    //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

    //     for (let k = 0; k < validForceDeviceXPanel.length; k++) {
    //       const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
    //       const xPanelTypeArray: any[] = [];
    //       xPanelTypeArray.push(xPanelType);
    //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
    //       xPanelTypeArray.push(projName);
    //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
    //       xPanelTypeArray.push(projType);
    //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));   
    //     }
    //   }
    // }

    const validProjectNameCases: any[] = [];
    for (let i = 0; i < validProjectNames.length; i++) {
      const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[i])) };
      const projNameArray: any[] = [];
      projNameArray.push(JSON.parse(JSON.stringify(projName)));
      validProjectNameCases.push(JSON.parse(JSON.stringify(projNameArray)));
    }

    const validProjectTypeCases: any[] = [];
    for (let j = 0; j < validProjectTypes.length; j++) {
      const projType = { "key": "projectType", "value": JSON.parse(JSON.stringify(validProjectTypes[j])) };
      const projTypeArray: any[] = [];
      projTypeArray.push(JSON.parse(JSON.stringify(projType)));
      validProjectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
      
      for (let i = 0; i < validProjectNameCases.length; i++) {
        const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectNameCases[i]));
        tempProjNameArray.push(JSON.parse(JSON.stringify(projType)));
        validProjectTypeCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
      }
    }

    const tempArray: any[] = JSON.parse(JSON.stringify(validProjectNameCases)).concat(JSON.parse(JSON.stringify(validProjectTypeCases)));

    const validForceDeviceXPanelCases: any[] = [];
    for (let k = 0; k < validForceDeviceXPanel.length; k++) {
      const xPanelType = { "key": "forceDeviceXPanel", "value": JSON.parse(JSON.stringify(validForceDeviceXPanel[k])) };
      const xPanelTypeArray: any[] = [];
      xPanelTypeArray.push( JSON.parse(JSON.stringify(xPanelType)));
      validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

      for (let i = 0; i < tempArray.length; i++) {
        const tempProjNameArray: any[] = JSON.parse(JSON.stringify(tempArray[i]));
        tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
        validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
      }
    }

    // console.log("-------------------");
    // console.log(JSON.parse(JSON.stringify(validProjectNameCases)));
    // console.log("-------------------");
    // console.log(JSON.parse(JSON.stringify(validProjectTypeCases)));
    // console.log("-------------------");
    // console.log(JSON.parse(JSON.stringify(validForceDeviceXPanelCases)));
    // console.log("-------------------");
    const positiveCases: any[] = validProjectNameCases.concat(validProjectTypeCases).concat(validForceDeviceXPanelCases);

    */