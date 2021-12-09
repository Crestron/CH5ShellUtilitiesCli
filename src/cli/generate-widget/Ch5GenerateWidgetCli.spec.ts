import { expect } from 'chai';
import * as sinon from "sinon";
import mock from 'mock-fs';
import { Ch5CliLogger } from "../Ch5CliLogger";
import { SinonStub } from "sinon";
import { Ch5GenerateWidgetCli } from "./Ch5GenerateWidgetCli";

const generateWidgetComponent = new Ch5GenerateWidgetCli();

describe('Generate widget >>>>>>>> ', () => {
    let loggerPrintWarningStub: SinonStub;
    let loggerPrintErrorStub: SinonStub;
    let loggerPrintSuccessStub: SinonStub;

    before(() => {
        mock();
    });

    after(() => {
        mock.restore();
    });

    beforeEach(() => {
        loggerPrintWarningStub = sinon.stub(Ch5CliLogger.prototype, 'printWarning');
        loggerPrintErrorStub = sinon.stub(Ch5CliLogger.prototype, 'printError');
        loggerPrintSuccessStub = sinon.stub(Ch5CliLogger.prototype, 'printSuccess');
        // Mock external enquirer library
        sinon.stub(Ch5GenerateWidgetCli.prototype, 'getEnquirer').get(() => {
            return {
                prompt: () => new Promise(resolve => resolve({
                    widgetName: 'leds',
                    menuOption: 'option'
                }))
            }
        })
    });

    afterEach(() => {
        // Revert any stubs / mocks created using sinon
        sinon.restore();
    });

    it('Expect to fail if page name already exists in project-config', async () => {
        mock({
            'app': {
                'project-config.json': JSON.stringify(mockedAppJson),
            }
        });

        generateWidgetComponent.setInputArgsForTesting(["--name", "pagedisplay"]); // this is a dummy method to force set value of args before proceeding with the testing
        const response = await generateWidgetComponent.run();
        expect(response).to.equal(false);
    });

    it(`Expect certain function to be called inside run method`, async () => {
        mock({
            'app': {
                'project-config.json': JSON.stringify(mockedAppJson),
            },
            'build': {
                'cli': {
                    'generate-widget': {
                        'templates': {
                            'html.template': '',
                            'js.template': '',
                            'scss.template': '',
                            'emulator.template': ''
                        }
                    }
                }
            }
        });
        const initializeSpy = sinon.spy(generateWidgetComponent, <any>'initialize');
        const checkPreValidationsSpy = sinon.spy(generateWidgetComponent, <any>'checkPrerequisiteValidations');
        const verifyInputSpy = sinon.spy(generateWidgetComponent, <any>'verifyInputParams');
        const checkPromptQuestionSpy = sinon.spy(generateWidgetComponent, <any>'checkPromptQuestions');
        const processRequestSpy = sinon.spy(generateWidgetComponent, <any>'processRequest');
        const cleanUpSpy = sinon.spy(generateWidgetComponent, <any>'cleanUp');

        generateWidgetComponent.setInputArgsForTesting(["--name", "leds"]); // this is a dummy method to force set value of args before proceeding with the testing
        const response = await generateWidgetComponent.run();
        expect(response).to.equal(true);

        sinon.assert.callOrder(initializeSpy, checkPreValidationsSpy, verifyInputSpy, checkPromptQuestionSpy, processRequestSpy, cleanUpSpy);
    });

    it(`Expect to trigger error if template files are missing`, async () => {
        mock({
            'app': {
                'project-config.json': JSON.stringify(mockedAppJson),
            }
        });
        const initializeSpy = sinon.spy(generateWidgetComponent, <any>'initialize');
        const checkPreValidationsSpy = sinon.spy(generateWidgetComponent, <any>'checkPrerequisiteValidations');
        const verifyInputSpy = sinon.spy(generateWidgetComponent, <any>'verifyInputParams');
        const checkPromptQuestionSpy = sinon.spy(generateWidgetComponent, <any>'checkPromptQuestions');
        const processRequestSpy = sinon.spy(generateWidgetComponent, <any>'processRequest');

        generateWidgetComponent.setInputArgsForTesting(["--name", "leds"]); // this is a dummy method to force set value of args before proceeding with the testing
        const response = await generateWidgetComponent.run();
        expect(response).to.equal(false);

        sinon.assert.callOrder(initializeSpy, checkPreValidationsSpy, verifyInputSpy, checkPromptQuestionSpy, processRequestSpy);
    });
});



const mockedAppJson = {
    "projectName": "Shell-Template",
    "version": "0.0.1",
    "faviconPath": "favicon.ico",
    "menuOrientation": "horizontal",
    "selectedTheme": "light-theme",
    "useWebXPanel": true,
    "themes": [
      {
        "name": "light-theme",
        "brandLogo": {
          "url": "./app/template/assets/img/ch5-logo-light.svg",
          "alt": "Crestron Logo",
          "receiveStateUrl": ""
        },
        "backgroundProperties": {
          "url": [
            "./app/template/assets/img/ch5-stone-light-bg.jpg"
          ]
        }
      },
      {
        "name": "dark-theme",
        "brandLogo": {
          "url": "./app/template/assets/img/ch5-logo-dark.svg",
          "alt": "Crestron Logo",
          "receiveStateUrl": ""
        },
        "backgroundProperties": {
          "url": [
            "./app/template/assets/img/ch5-stone-dark-bg.jpg"
          ]
        }
      },
      {
        "name": "project-light-theme",
        "brandLogo": {
          "url": "./app/template/assets/img/ch5-logo-light.svg",
          "alt": "Crestron Logo",
          "receiveStateUrl": ""
        },
        "backgroundProperties": {
          "url": [
            "./app/template/assets/img/ch5-stone-light-bg.jpg"
          ]
        }
      },
      {
        "name": "project-dark-theme",
        "brandLogo": {
          "url": "./app/template/assets/img/ch5-logo-dark.svg",
          "alt": "Crestron Logo",
          "receiveStateUrl": ""
        },
        "backgroundProperties": {
          "url": [
            "./app/template/assets/img/ch5-stone-dark-bg.jpg"
          ]
        }
      },
      {
        "name": "project-custom-theme",
        "brandLogo": {
          "url": "./app/template/assets/img/ch5-logo-light.svg",
          "alt": "Crestron Logo",
          "receiveStateUrl": ""
        },
        "backgroundProperties": {
          "url": [
            "./app/template/assets/img/ch5-stone-light-bg.jpg"
          ]
        }
      }
    ],
    "config": {
      "controlSystem": {}
    },
    "header": {
      "display": true,
      "displayInfo": true,
      "$component": ""
    },
    "footer": {
      "display": true,
      "$component": ""
    },
    "content": {
      "$defaultView": "page1",
      "triggerViewProperties": {
        "gestureable": true
      },
      "pages": [
        {
          "pageName": "page1",
          "fullPath": "./app/project/components/pages/page1/",
          "fileName": "page1.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 1,
            "label": "menu.page1",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        },
        {
          "pageName": "page2",
          "fullPath": "./app/project/components/pages/page2/",
          "fileName": "page2.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 2,
            "label": "menu.page2",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        },
        {
          "pageName": "page3",
          "fullPath": "./app/project/components/pages/page3/",
          "fileName": "page3.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 3,
            "label": "menu.page3",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        },
        {
          "pageName": "page4",
          "fullPath": "./app/project/components/pages/page4/",
          "fileName": "page4.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 4,
            "label": "menu.page4",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        },
        {
          "pageName": "page5",
          "fullPath": "./app/project/components/pages/page5/",
          "fileName": "page5.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 5,
            "label": "menu.page5",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        },
        {
          "pageName": "page6",
          "fullPath": "./app/project/components/pages/page6/",
          "fileName": "page6.html",
          "standAloneView": false,
          "pageProperties": {
            "sendEventOnShow": ""
          },
          "navigation": {
            "sequence": 6,
            "label": "menu.page6",
            "isI18nLabel": true,
            "iconClass": "fas fa-file-alt",
            "iconUrl": "",
            "iconPosition": "bottom"
          }
        }
      ],
      "widgets": [
        {
          "widgetName": "pagedisplay",
          "fullPath": "./app/project/components/widgets/pagedisplay/",
          "fileName": "pagedisplay.html",
          "widgetProperties": {}
        }
      ]
    }
  }
