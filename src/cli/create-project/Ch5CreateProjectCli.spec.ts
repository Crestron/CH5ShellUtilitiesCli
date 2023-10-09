import { expect, assert, config } from 'chai';
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

describe('Create:Project Functions >>>>>>>> ', () => {

  let createProjectCli: Ch5CreateProjectCli;
  let protoCreateProjectCli: any;
  let configJson: any;
  let i18nJson: any;

  before(async function () {
    createProjectCli = new Ch5CreateProjectCli();
    protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
    configJson = await readJSONFile("./src/cli/create-project/files/config.json");
    i18nJson = await readJSONFile("./src/cli/create-project/i18n/en.json");
  });

  // afterEach(function () {
  //   if (this.currentTest?.state === 'failed') {
  //     // a test just failed
  //     console.log("test failed", this.currentTest?.fullTitle);
  //   }
  // });

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
    const output = createProjectCli.getCLIExecutionPath();
    expect(output).to.equal(__dirname);
  });

  const cliTestValues: any = [
    {
      key: "projectType",
      values: [
        {
          input: ["shell-template", "adasf", "ddd", null, undefined, ""],
          output: "shell-template",
          error: ""
        },
        {
          input: ["ZoomRoomControl", "zoomroomcontrol"],
          output: "zoomroomcontrol",
          error: ""
        }
      ]
    },
    {
      key: "forceDeviceXPanel",
      values: [
        {
          input: ["true", "Y", "y"],
          output: true,
          error: ""
        },
        {
          input: ["false", "N", "n", "ABC", null, undefined, "", "123"],
          output: false,
          error: ""
        }
      ]
    }
  ];

  /*
    - project name length should be greater than zero and cannot exceed 214
    - project name characters must be lowercase i.e., no uppercase or mixed case names are allowed
    - project name can consist of hyphens, tilde, numbers and alphabets
    - project name can consist of underscore and dot but these cannot start with these characters
    - project name must not contain any non-url-safe characters (since name ends up being part of a URL)
    - project name should not contain any spaces or any of the following characters: ! @ # $ % ^ & * ( ) + = [ { } ] | \ : ; " ' < , > ? /
    */

  const invalidProjNamesSet1: string[] = [];
  const invalidProjectNameChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', '{', '}', ']', '|', '\\', ':', ';', '<', ',', '>', '?', '/', '\'', '\"'];
  for (let i = 0; i < invalidProjectNameChars.length; i++) {
    invalidProjNamesSet1.push("abc" + invalidProjectNameChars[i]);
    invalidProjNamesSet1.push("123" + invalidProjectNameChars[i]);
    invalidProjNamesSet1.push("ab" + invalidProjectNameChars[i] + "12");
    invalidProjNamesSet1.push("12" + invalidProjectNameChars[i] + "bc");
    invalidProjNamesSet1.push("ab" + invalidProjectNameChars[i] + "bc");
    invalidProjNamesSet1.push("12" + invalidProjectNameChars[i] + "34");
    invalidProjNamesSet1.push(invalidProjectNameChars[i] + "abc");
    invalidProjNamesSet1.push(invalidProjectNameChars[i] + "123");
  }

  const projectNameCases: any = [];
  projectNameCases.push({ input: ["12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345"], output: null });
  projectNameCases.push({ input: ["1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234"], outputSameAsInput: true, error: "" });
  projectNameCases.push({ input: ["AbCDEf", "abcdE", "AB"], output: null });
  projectNameCases.push({ input: ["--a", "-a", "a-", "a--", "a--b", "~~a", "~a", "a~", "a~~", "a~~b", "abc", "a", "1"], error: "", outputSameAsInput: true });
  projectNameCases.push({ input: ["a_", "a__", "a__b", "a.", "a..", "a..b"], error: "", outputSameAsInput: true });
  projectNameCases.push({ input: ["__a", "_a", "..a", ".a"], output: null });
  projectNameCases.push({ input: invalidProjNamesSet1, output: null });

  cliTestValues.push({
    key: "projectName",
    values: projectNameCases
  });

  console.log("cliTestValues", JSON.stringify(cliTestValues));
  for (let i = 0; i < cliTestValues.length; i++) {
    for (let j = 0; j < cliTestValues[i].values.length; j++) {
      for (let k = 0; k < cliTestValues[i].values[j].input.length; k++) {
        it('validateCLIInputArgument: ' + cliTestValues[i].key + ", " + cliTestValues[i].values[j].input[k], async function () {
          const projectTypeFromConfigJson = configJson.options.find((configVal: any) => configVal.key === cliTestValues[i].key);
          projectTypeFromConfigJson.inputReceived = true;
          projectTypeFromConfigJson.inputValue = cliTestValues[i].values[j].input[k];
          const output = createProjectCli.validateCLIInputArgument(projectTypeFromConfigJson);
          if (cliTestValues[i].values[j].outputSameAsInput === true) {
            cliTestValues[i].values[j].output = cliTestValues[i].values[j].input[k];
          }
          expect(output.value).to.equal(cliTestValues[i].values[j].output);
          if (cliTestValues[i].values[j].error !== "") {
            cliTestValues[i].values[j].error = createProjectCli.getText("COMMON.VALIDATIONS.PROJECT_NAME");
          }
          expect(output.warning).to.equal(cliTestValues[i].values[j].error);
          if (cliTestValues[i].key === "projectName") {
            const { lastOutput } = await run('mkdir -p ' + path.resolve("build/automation-tests/folders-project-name/") + cliTestValues[i].values[j].input[k], []);
            console.log("lastOutput", lastOutput);
          }
        });
      }
    }
  }


  describe('Help (-h) >>>>>>>> ', function () {
    this.timeout(10000);
    it('Help File', async () => {
      const { lastOutput } = await run('ch5-shell-cli create:project -h', []);
      const actualValue = await fs.readFileSync("./src/cli/create-project/files/help.txt", "utf-8");
      // Reason to have.string is because the lastOutput starts with dynamically created options in the help output
      expect(String(lastOutput)).to.have.string(String(actualValue));
    });
  });

});

// describe('Create Project Tests', async function () {

//   let createProjectCli: Ch5CreateProjectCli;
//   let protoCreateProjectCli: any;
//   let configJson: any;
//   let repoFolder: any;
//   let i18nJson: any;

//   // Calls to timeout are hierarchical. The problem is that beforeEach has no children. So we need to set timeout globally.
//   this.timeout(10000);
//   const DEFAULT_EXECUTION_PATH = path.resolve("./");

//   before(async function () {
//     createProjectCli = new Ch5CreateProjectCli();
//     protoCreateProjectCli = Object.getPrototypeOf(createProjectCli);
//     i18nJson = await readJSONFile("./src/cli/create-project/i18n/en.json");
//     configJson = await readJSONFile("./src/cli/create-project/files/config.json");
//     repoFolder = path.resolve("./");
//   });

//   beforeEach(async function () {
//     process.chdir(DEFAULT_EXECUTION_PATH);
//   });

//   await createProjectShellTests(getAllPositiveTestCases(), "Positive Case");
//   await createProjectShellTests(getInvalidProjectTypeCases(), "Invalid ProjectType Case");
//   await createProjectShellTests(getInvalidForceDeviceXPanelCases(), "Invalid ForceDeviceXPanel Case");

//   async function createProjectShellTests(shellProjectTestCases: any[], testCaseName: string) {
//     // const shellProjectTestCases = getInvalidProjectTypeCases();
//     for (let i = 0; i < shellProjectTestCases.length; i++) {
//       const caseName = testCaseName + " " + i;
//       describe('Create: ' + caseName + ": " + JSON.stringify(shellProjectTestCases[i]), function () {

//         let shellProject: any = null;

//         before(async function () {
//           shellProject = await createProject(caseName, shellProjectTestCases[i]);
//         });

//         after(async function () {
//           process.chdir(DEFAULT_EXECUTION_PATH);
//           const fullDirectory = 'build/automation-tests/' + caseName;
//           await run("rm -rf " + path.resolve("./" + fullDirectory), []);
//         });

//         it("Output message", function () {
//           // Reason to have.string is because the lastOutput will contain color coding for message
//           expect(String(shellProject.actual)).to.have.string(shellProject.expected);
//         });

//         it("package.json name", async function () {
//           // Read package.json for projectName
//           const packageJSON: any = await readJSONFile(shellProject.pathToExecute, shellProject.projectName, "package.json");
//           expect(String(packageJSON.name)).to.equal(shellProject.projectName);
//         });

//         it("project-config values", async function () {
//           // Read project-config.json
//           const projectConfig: any = await readJSONFile(shellProject.pathToExecute, shellProject.projectName, "app", "project-config.json");
//           expect(String(projectConfig.projectName)).to.equal(shellProject.projectName);
//           expect(String(projectConfig.projectType)).to.equal(shellProject.projectType);
//           expect(projectConfig.forceDeviceXPanel).to.equal(shellProject.forceDeviceXPanel);
//         });

//         it("Check for folders and files availability as per template", function () {
//           // Check for availability of files as per template
//           const pathForTemplate: any = configJson.custom.templates[shellProject.projectType];
//           for (let j = 0; j < pathForTemplate.customFolders.length; j++) {
//             const path1 = path.resolve(repoFolder, "./src/project-templates/" + shellProject.projectType + "/" + pathForTemplate.customFolders[j]);
//             const path2 = path.resolve(shellProject.pathToExecute + '/' + shellProject.projectName + '/' + pathForTemplate.customFolders[j]);
//             const responseDirCompare = dircompare.compareSync(path1, path2);
//             expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
//           }
//           for (let j = 0; j < pathForTemplate.customFiles.length; j++) {
//             if (pathForTemplate.customFiles[j] !== "package.json" && pathForTemplate.customFiles[j] !== "packagelock.json") {
//               const path1 = path.resolve(repoFolder, "./src/shell/" + pathForTemplate.customFiles[j]);
//               const path2 = path.resolve(shellProject.pathToExecute + '/' + shellProject.projectName + '/' + pathForTemplate.customFiles[j]);
//               const responseDirCompare = dircompare.compareSync(path1, path2);
//               expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
//             }
//           }
//           // Run val:pc
//         });
//       });
//     }
//   }

//   async function createProject(createInFolderName: string, args: any[]) {
//     const pathToExecute = await changeDirectory(createInFolderName.replace(/ /gi, '_'));
//     process.chdir(pathToExecute);
//     let argumentString = "";
//     let projectName = "";
//     let projectType = "";
//     let forceDeviceXPanel: string | boolean = "";

//     for (let i = 0; i < args.length; i++) {
//       argumentString += "--" + args[i].key + " " + args[i].value + " ";
//       if (args[i].key.toLowerCase() === "projectname") {
//         projectName = args[i].value;
//       } else if (args[i].key.toLowerCase() === "projecttype") {
//         projectType = args[i].value;
//       } else if (args[i].key.toLowerCase() === "forcedevicexpanel") {
//         if ((['true', 'Y', 'y']).includes(args[i].value)) {
//           forceDeviceXPanel = true;
//         } else if ((['false', 'N', 'n']).includes(args[i].value)) {
//           forceDeviceXPanel = false;
//         }
//       }
//     }

//     if (!projectType || projectType === "" || (projectType.toLowerCase() !== "shell-template" && projectType.toLowerCase() !== "zoomroomcontrol")) {
//       projectType = "shell-template";
//     }
//     projectType = projectType.toLowerCase();
//     if (projectType === "zoomroomcontrol") {
//       forceDeviceXPanel = true;
//     } else {
//       if (!forceDeviceXPanel || forceDeviceXPanel === "") {
//         forceDeviceXPanel = false;
//       } else {
//         forceDeviceXPanel = Boolean(forceDeviceXPanel);
//       }
//     }

//     const { lastOutput } = await run('ch5-shell-cli create:project ' + argumentString, []);
//     const expectedResponse = createProjectCli.getText("LOG_OUTPUT.SUCCESS_MESSAGE", projectName, protoCreateProjectCli.getCurrentWorkingDirectory());
//     return { expected: expectedResponse, actual: lastOutput, pathToExecute, projectName, projectType: projectType.toLowerCase(), forceDeviceXPanel };
//   }

// });

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

function isUpperCase(inputValue: string) {
  return /^[A-Z]*$/.test(inputValue);
}

function getAllPositiveTestCases() {
  const validProjectNames = ["shell-template", "abc123"];
  const validProjectTypes = ["shell-template", "ZoomRoomControl", "zoomroomcontrol"];
  const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

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
