import { Ch5UpdateProjectCli } from '../update-project/Ch5UpdateProjectCli';
import { expect, assert } from 'chai';
const fs = require('fs');
const path = require('path');
import { run, UP, DOWN, ENTER, EXIT } from 'cli-mocker';
import { prepareEnvironment } from '@gmrchk/cli-testing-library';


// describe('Update project >>>>>>>>', () => {
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

describe('Update project >>>>>>>', function () {

  describe('Functions >>>>>>>> ', () => {

    let updateProjectCli: Ch5UpdateProjectCli;
    let protoCreateProjectCli: any;
    let i18nJson: any;

    before(async () => {
      updateProjectCli = new Ch5UpdateProjectCli();
      protoCreateProjectCli = Object.getPrototypeOf(updateProjectCli);
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

      updateProjectCli.initialize();
      assert.deepEqual(updateProjectCli.getOutputResponse(), expectedResult);
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
      const updateProjectCli = new Ch5UpdateProjectCli();
      const output = updateProjectCli.getCLIExecutionPath();
      expect(output).to.equal(__dirname);
    });
  });

  describe.only("CLI tests >>>>>>>", function () {
    let updateProjectCli: Ch5UpdateProjectCli;
    let protoUpdateProjectCli: any;
    let i18nJson: any;
    let pathToExecute: string;

    this.timeout(1000000);
    const DEFAULT_EXECUTION_PATH = path.resolve("./");

    before(async () => {
      updateProjectCli = new Ch5UpdateProjectCli();
      protoUpdateProjectCli = Object.getPrototypeOf(updateProjectCli);
      i18nJson = await readI18nJson();
      pathToExecute = await changeDirectory("shell-template");
      process.chdir(pathToExecute);
      await run('ch5-shell-cli create:project --projectName shell-template', []);
    });

    // it('Help File', async () => {
    //   const { lastOutput } = await run('ch5-shell-cli update:project -h', []);
    //   const actualValue = await fs.readFileSync("./src/cli/update-project/files/help.txt", "utf-8");
    //   // Reason to have.string is because the lastOutput starts with dynamically created options in the help output
    //   expect(String(lastOutput)).to.have.string(String(actualValue));
    // });

    const positiveCases = getAllPositiveTestCases();
    for (let i = 0; i < positiveCases.length; i++) {
      it('Update: Positive Case ' + i + ": " + JSON.stringify(positiveCases[i]), async function () {
        const output = await updateProject("PositiveCase" + i, positiveCases[i]);
        // Reason to have.string is because the lastOutput will contain color coding for message
        // expect(String(output.actual)).to.have.string(output.expected);

        // Read package.json for projectName
        const packageJSON: any = await readJSONFile(output.fullPath, "package.json");

        expect(String(packageJSON.name)).to.equal(output.projectName);

        // Read project-config.json
        const projectConfig: any = await readJSONFile(output.fullPath, "app", "project-config.json");
        expect(String(projectConfig.projectName)).to.equal(output.projectName);
        expect(String(projectConfig.projectType)).to.equal(output.projectType);
        expect(projectConfig.forceDeviceXPanel).to.equal(output.forceDeviceXPanel);

        // Check for availability of files as per template
      });
    }

    async function updateProject(createInFolderName: string, args: any[]) {
      const fullPath = path.resolve(pathToExecute + "/shell-template/");
      process.chdir(fullPath);
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

      const { lastOutput } = await run('ch5-shell-cli update:project ' + argumentString, []);
      const expectedResponse = updateProjectCli.getText("LOG_OUTPUT.SUCCESS_MESSAGE", projectName, protoUpdateProjectCli.getCurrentWorkingDirectory());
      return { expected: expectedResponse, actual: lastOutput, fullPath, projectName, projectType, forceDeviceXPanel };
    }
  });
});

function getAllPositiveTestCases() {
  const validProjectNames = ["shell-template", "abc", "shell1"];
  const validProjectTypes = ["zoomroomcontrol", "shell-template", "ZoomRoomControl"];
  const validForceDeviceXPanel = ["true", "y", "Y", "N", "n", "false"];
  const validUseWebXPanel = ["true", "y", "Y", "N", "n", "false"];

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

  const validUseWebXPanelCases: any[] = [];
  for (let k = 0; k < validUseWebXPanel.length; k++) {
    const xPanelType = { "key": "useWebXPanel", "value": validUseWebXPanel[k] };
    const xPanelTypeArray: any[] = [];
    xPanelTypeArray.push(JSON.parse(JSON.stringify(xPanelType)));
    validUseWebXPanelCases.push(JSON.parse(JSON.stringify(xPanelTypeArray)));

    for (let i = 0; i < validProjectTypeCases.length; i++) {
      const tempProjNameArray: any[] = JSON.parse(JSON.stringify(validProjectTypeCases[i]));
      tempProjNameArray.push(JSON.parse(JSON.stringify(xPanelType)));
      validUseWebXPanelCases.push(JSON.parse(JSON.stringify(tempProjNameArray)));
    }
  }

  const projectTypeAndXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validForceDeviceXPanelCases)));
  const useWebXPanelCases: any[] = JSON.parse(JSON.stringify(validProjectTypeCases.concat(validUseWebXPanelCases)));
  const positiveCases: any[] = [];
  for (let i = 0; i < projectTypeAndXPanelCases.length; i++) {
    for (let j = 0; j < validProjectNames.length; j++) {
      const projName = { "key": "projectName", "value": JSON.parse(JSON.stringify(validProjectNames[j])) };
      const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
      temporaryArray.push(JSON.parse(JSON.stringify(projName)));
      positiveCases.push(JSON.parse(JSON.stringify(temporaryArray)));
    }
  }

  for (let i = 0; i < useWebXPanelCases.length; i++) {
    for (let j = 0; j < validUseWebXPanelCases.length; j++) {
      const projName = { "key": "useWebXPanel", "value": JSON.parse(JSON.stringify(validUseWebXPanelCases[j])) };
      const temporaryArray = JSON.parse(JSON.stringify(projectTypeAndXPanelCases[i]));
      temporaryArray.push(JSON.parse(JSON.stringify(projName)));
      positiveCases.push(JSON.parse(JSON.stringify(temporaryArray)));
    }
  }

  // console.log("positiveCases (" + positiveCases.length + "): ", JSON.parse(JSON.stringify(positiveCases)));
  return positiveCases;
}

async function readJSONFile(...pathName: any) {
  const data = await fs.readFileSync(path.resolve(path.join(...pathName)));
  return JSON.parse(data);
}

async function readI18nJson() {
  return await readJSONFile("./src/cli/create-project/i18n/en.json");
}

async function changeDirectory(directoryName: string) {
  const fullDirectory = 'build/automation-tests/' + directoryName;
  await createFolderForProjectCreation(fullDirectory);
  return path.resolve("./" + fullDirectory);
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