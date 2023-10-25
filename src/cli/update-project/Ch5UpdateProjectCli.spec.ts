// import { expect, assert } from 'chai';
// import { Ch5UpdateProjectCli } from './Ch5UpdateProjectCli';
// import { run, UP, DOWN, ENTER, EXIT } from 'cli-mocker';

// const fs = require('fs');
// const path = require('path');
// const dircompare = require('dir-compare');

// describe('Update project >>>>>>>',  () => {

//   describe('Functions >>>>>>>> ', () => {

//     let updateProjectCli: Ch5UpdateProjectCli;
//     let protoUpdateProjectCli: any;
//     let i18nJson: any;

//     before(async () => {
//       updateProjectCli = new Ch5UpdateProjectCli();
//       protoUpdateProjectCli = Object.getPrototypeOf(updateProjectCli);
//       i18nJson = await readI18nJson();
//     });

//     it('initialize()', () => {
//       const expectedResult = {
//         askConfirmation: false,
//         result: false,
//         errorMessage: "",
//         warningMessage: "",
//         successMessage: "",
//         backupFolder: "",
//         data: {
//           updatedInputs: [],
//           projectName: "",
//           projectType: ""
//         }
//       };

//       updateProjectCli.initialize();
//       assert.deepEqual(updateProjectCli.getOutputResponse(), expectedResult);
//     });

//     it('containsSpecialCharsInPackageName()', async () => {
//       const dataArray = [
//         {
//           "key": "AAAAA",
//           "value": false
//         },
//         {
//           "key": "BB@AAA",
//           "value": true
//         },
//         {
//           "key": "CCC_.",
//           "value": false
//         }
//       ];
//       for (let i = 0; i < dataArray.length; i++) {
//         const output = protoUpdateProjectCli.containsSpecialCharsInPackageName(dataArray[i].key);
//         expect(output).to.equal(dataArray[i].value);
//       }
//     });

//     it('getCLIExecutionPath', async () => {
//       const updateProjectCli = new Ch5UpdateProjectCli();
//       const output = updateProjectCli.getCLIExecutionPath();
//       expect(output).to.equal(__dirname);
//     });
//   });

//   describe('Help (-h) >>>>>>>> ', function () {
//     it('Help File', async () => {
//       const { lastOutput } = await run('ch5-shell-cli update:project -h', []);
//       const actualValue = await fs.readFileSync("./src/cli/update-project/files/help.txt", "utf-8");
//       // Reason to have.string is because the lastOutput starts with dynamically created options in the help output
//       expect(String(lastOutput)).to.have.string(String(actualValue));
//     });
//   });

//   describe("Update Project Tests", async function () {
    
//     let updateProjectCli: Ch5UpdateProjectCli;
//     let protoUpdateProjectCli: any;
//     let i18nJson: any;
//     let configJson: any;
//     let repoFolder: any;

//     // Calls to timeout are hierarchical. The problem is that beforeEach has no children. So we need to set timeout globally.
//     this.timeout(10000);
//     const DEFAULT_EXECUTION_PATH = path.resolve("./");

//     before(async function()  {
//       updateProjectCli = new Ch5UpdateProjectCli();
//       protoUpdateProjectCli = Object.getPrototypeOf(updateProjectCli);
//       i18nJson = await readJSONFile("./src/cli/update-project/i18n/en.json");
//       configJson = await readJSONFile("./src/cli/update-project/files/config.json");
//       repoFolder = path.resolve("./");
//     });

//     beforeEach(async function() {
//       process.chdir(DEFAULT_EXECUTION_PATH);
//     });
    
//     await updateProjectShellTests(getAllPositiveTestCases(), "Positive Case");
//     await updateProjectShellTests(getInvalidProjectTypeCases(), "Invalid ProjectType Case");
//     await updateProjectShellTests(getInvalidForceDeviceXPanelCases(), "Invalid ForceDeviceXPanel Case");

//     async function updateProjectShellTests(shellProjectTestCases: any[], testCaseName: string) {
//       // const shellProjectTestCases = getInvalidProjectTypeCases();
//       for (let i = 0; i < shellProjectTestCases.length; i++) {
//         const caseName = testCaseName + " " + i;
//         describe('Update: ' + caseName + ": " + JSON.stringify(shellProjectTestCases[i]), function () {

//           let shellProject: any = null;

//           before(async function () {
//             shellProject = await updateProject(caseName, shellProjectTestCases[i]);
//           });

//           after(async function () {
//             process.chdir(DEFAULT_EXECUTION_PATH);
//             const fullDirectory = 'build/automation-tests/' + caseName;
//             await run("rm -rf " + path.resolve("./" + fullDirectory), []);
//           });

//           it("Output message", function () {
//             // Reason to have.string is because the lastOutput will contain color coding for message
//             expect(String(shellProject.actual)).to.have.string(shellProject.expected);
//           });

//           it("package.json name", async function () {
//             // Read package.json for projectName
//             const packageJSON: any = await readJSONFile(shellProject.pathToExecute, shellProject.projectName, "package.json");
//             expect(String(packageJSON.name)).to.equal(shellProject.projectName);
//           });

//           it("project-config values", async function () {
//             // Read project-config.json
//             const projectConfig: any = await readJSONFile(shellProject.pathToExecute, shellProject.projectName, "app", "project-config.json");
//             expect(String(projectConfig.projectName)).to.equal(shellProject.projectName);
//             expect(String(projectConfig.projectType)).to.equal(shellProject.projectType);
//             expect(projectConfig.forceDeviceXPanel).to.equal(shellProject.forceDeviceXPanel);
//           });

//           it("Check for folders and files availability as per template", function () {
//             // Check for availability of files as per template
//             const pathForTemplate: any = configJson.custom.templates[shellProject.projectType];
//             for (let j = 0; j < pathForTemplate.customFolders.length; j++) {
//               const path1 = path.resolve(repoFolder, "./src/project-templates/" + shellProject.projectType + "/" + pathForTemplate.customFolders[j]);
//               const path2 = path.resolve(shellProject.pathToExecute + '/' + shellProject.projectName + '/' + pathForTemplate.customFolders[j]);
//               const responseDirCompare = dircompare.compareSync(path1, path2);
//               expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
//             }
//             for (let j = 0; j < pathForTemplate.customFiles.length; j++) {
//               if (pathForTemplate.customFiles[j] !== "package.json" && pathForTemplate.customFiles[j] !== "packagelock.json") {
//                 const path1 = path.resolve(repoFolder, "./src/shell/" + pathForTemplate.customFiles[j]);
//                 const path2 = path.resolve(shellProject.pathToExecute + '/' + shellProject.projectName + '/' + pathForTemplate.customFiles[j]);
//                 const responseDirCompare = dircompare.compareSync(path1, path2);
//                 expect(responseDirCompare.totalFiles).to.equal(responseDirCompare.equalFiles);
//               }
//             }
//             // Run val:pc
//           });
//         });
//       }
//     }

//     async function updateProject(updateInFolderName: string, args: any[]) {
//       const pathToExecute = await changeDirectory(updateInFolderName);
//       process.chdir(pathToExecute);
//       let argumentString = "";
//       let projectName = "";
//       let projectType = "";
//       let forceDeviceXPanel: string | boolean = "";

//       for (let i = 0; i < args.length; i++) {
//         argumentString += "--" + args[i].key + " " + args[i].value + " ";
//         if (args[i].key.toLowerCase() === "projectname") {
//           projectName = args[i].value;
//         } else if (args[i].key.toLowerCase() === "projecttype") {
//           projectType = args[i].value;
//         } else if (args[i].key.toLowerCase() === "forcedevicexpanel") {
//           if ((['true', 'Y', 'y']).includes(args[i].value)) {
//             forceDeviceXPanel = true;
//           } else if ((['false', 'N', 'n']).includes(args[i].value)) {
//             forceDeviceXPanel = false;
//           }
//         }
//       }

//       if (!projectType || projectType === "" || (projectType.toLowerCase() !== "shell-template" && projectType.toLowerCase() !== "zoomroomcontrol")) {
//         projectType = "shell-template";
//       }
//       projectType = projectType.toLowerCase();
//       if (projectType === "zoomroomcontrol") {
//         forceDeviceXPanel = true;
//       } else {
//         if (!forceDeviceXPanel || forceDeviceXPanel === "") {
//           forceDeviceXPanel = false;
//         } else {
//           forceDeviceXPanel = Boolean(forceDeviceXPanel);
//         }
//       }

//       const { lastOutput } = await run('ch5-shell-cli update:project --projectName abc',  []);
//       const expectedResponse = updateProjectCli.getText("LOG_OUTPUT.SUCCESS_MESSAGE", projectName, protoUpdateProjectCli.getCurrentWorkingDirectory());
//       return { expected: expectedResponse, actual: lastOutput, pathToExecute, projectName, projectType, forceDeviceXPanel };
//     }
//   });
// });

// function getInvalidProjectTypeCases() {
//   const validProjectNames = ["shell-template"];
//   const inValidProjectTypes = ["", null, undefined, "JUNK"];
//   const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

//   const validProjectTypeCases: any[] = [];
//   for (let j = 0; j < inValidProjectTypes.length; j++) {
//     const projType = { "key": "projectType", "value": inValidProjectTypes[j] };
//     const projTypeArray: any[] = [];
//     projTypeArray.push(JSON.parse(JSON.stringify(projType)));
//     validProjectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
//   }

//   const validForceDeviceXPanelCases: any[] = [];
//   for (let k = 0; k < validForceDeviceXPanel.length; k++) {
//     const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
//     const xPanelTypeArray: any[] = [];
//     xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
//     validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

//     for (let i = 0; i < validProjectTypeCases.length; i++) {
//       const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectTypeCases[i]));
//       tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
//       validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
//     }
//   }

//   const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validForceDeviceXPanelCases)));
//   const fullSetOfCases: any[] = [];
//   for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
//     for (let j = 0; j < validProjectNames.length; j++) {
//       const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
//       const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
//       temporaryArray.push(JSON.parse(JSON.stringify(projName)));
//       fullSetOfCases.push(JSON.parse(JSON.stringify(temporaryArray)));
//     }
//   }

//   return fullSetOfCases;
// }

// function getInvalidForceDeviceXPanelCases() {
//   const validProjectNames = ["shell-template"];
//   const validProjectTypes = ["shell-template", "zoomroomcontrol"];
//   const invalidForceDeviceXPanel = ["A", "1", "0", 1, 0, null, "", undefined];

//   const projectTypeCases: any[] = [];
//   for (let j = 0; j < validProjectTypes.length; j++) {
//     const projType = { "key": "projectType", "value": validProjectTypes[j] };
//     const projTypeArray: any[] = [];
//     projTypeArray.push(JSON.parse(JSON.stringify(projType)));
//     projectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
//   }

//   const forceDeviceXPanelCases: any[] = [];
//   for (let k = 0; k < invalidForceDeviceXPanel.length; k++) {
//     const xPanelType = { "key": "forceDeviceXPanel", "value": invalidForceDeviceXPanel[k] };
//     const xPanelTypeArray: any[] = [];
//     xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
//     forceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

//     for (let i = 0; i < projectTypeCases.length; i++) {
//       const tempProjNameArray: any[] = JSON.parse(JSON.stringify(projectTypeCases[i]));
//       tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
//       forceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
//     }
//   }

//   const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(projectTypeCases.concat(forceDeviceXPanelCases)));
//   const fullSetOfCases: any[] = [];
//   for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
//     for (let j = 0; j < validProjectNames.length; j++) {
//       const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
//       const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
//       temporaryArray.push(JSON.parse(JSON.stringify(projName)));
//       fullSetOfCases.push(JSON.parse(JSON.stringify(temporaryArray)));
//     }
//   }

//   return fullSetOfCases;
// }

// function getAllPositiveTestCases() {
//   const validProjectNames = ["shell-template", "abc123"];
//   const validProjectTypes = ["shell-template", "ZoomRoomControl", "zoomroomcontrol"];
//   const validForceDeviceXPanel = ["true", "false", "Y", "N", "y", "n"];

//   // const positiveCases1: any[] = [];
//   // for (let i = 0; i < validProjectNames.length; i++) {
//   //   const projName = { "key": "projectName", "value": validProjectNames[i] };
//   //   const projNameArray: any[] = [];
//   //   projNameArray.push(projName);
//   //   positiveCases1.push(JSON.parse(JSON.stringify(projNameArray)));

//   //   for (let j = 0; j < validProjectTypes.length; j++) {
//   //     const projType = { "key": "projectType", "value": validProjectTypes[j] };
//   //     const projTypeArray: any[] = [];
//   //     projTypeArray.push(projType);
//   //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

//   //     projTypeArray.push(projName);
//   //     positiveCases1.push(JSON.parse(JSON.stringify(projTypeArray)));

//   //     for (let k = 0; k < validForceDeviceXPanel.length; k++) {
//   //       const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
//   //       const xPanelTypeArray: any[] = [];
//   //       xPanelTypeArray.push(xPanelType);
//   //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
//   //       xPanelTypeArray.push(projName);
//   //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));  
//   //       xPanelTypeArray.push(projType);
//   //       positiveCases1.push(JSON.parse(JSON.stringify(xPanelTypeArray)));   
//   //     }
//   //   }
//   // }

//   // const validProjectNameCases: any[] = [];
//   // for (let i = 0; i < validProjectNames.length; i++) {
//   //   const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[i])) };
//   //   const projNameArray: any[] = [];
//   //   projNameArray.push(JSON.parse(JSON.stringify(projName)));
//   //   validProjectNameCases.push(JSON.parse(JSON.stringify(projNameArray)));
//   // }

//   const validProjectTypeCases: any[] = [];
//   for (let j = 0; j < validProjectTypes.length; j++) {
//     const projType = { "key": "projectType", "value": validProjectTypes[j] };
//     const projTypeArray: any[] = [];
//     projTypeArray.push(JSON.parse(JSON.stringify(projType)));
//     validProjectTypeCases.push(JSON.parse(JSON.stringify(projTypeArray)));
//   }

//   const validForceDeviceXPanelCases: any[] = [];
//   for (let k = 0; k < validForceDeviceXPanel.length; k++) {
//     const xPanelType = { "key": "forceDeviceXPanel", "value": validForceDeviceXPanel[k] };
//     const xPanelTypeArray: any[] = [];
//     xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
//     validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

//     for (let i = 0; i < validProjectTypeCases.length; i++) {
//       const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectTypeCases[i]));
//       tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
//       validForceDeviceXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
//     }
//   }

//   const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validForceDeviceXPanelCases)));
//   const positiveCases: any[] = [];
//   for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
//     for (let j = 0; j < validProjectNames.length; j++) {
//       const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
//       const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
//       temporaryArray.push(JSON.parse(JSON.stringify(projName)));
//       positiveCases.push(JSON.parse(JSON.stringify(temporaryArray)));
//     }
//   }

//   // console.log("positiveCases (" + positiveCases.length + "): ", JSON.parse(JSON.stringify(positiveCases)));
//   return positiveCases;
// }

// async function updateFolderForProjectCreation(directoryName: string) {
//   directoryName = replaceAll(directoryName, "\"", "/");
//   const directories = directoryName.split("/");
//   let currentDirectory = "./";
//   for (let i = 0; i < directories.length; i++) {
//     currentDirectory += directories[i] + "/";
//     await run('mkdir ' + path.resolve(currentDirectory), []);
//     await run('cd ' + path.resolve(currentDirectory), []);
//   }
// }

// function replaceAll(str: string, find: string, replace: string) {
//   return str.replace(new RegExp(find, 'g'), replace);
// }

// async function changeDirectory(directoryName: string) {
//   const fullDirectory = 'build/automation-tests/' + directoryName;
//   await updateFolderForProjectCreation(fullDirectory);
//   return path.resolve("./" + fullDirectory);
// }

// async function readJSONFile(...pathName: any) {
//   const data = await fs.readFileSync(path.resolve(path.join(...pathName)));
//   return JSON.parse(data);
// }

// async function readI18nJson() {
//   return await readJSONFile("./src/cli/update-project/i18n/en.json");
// }
