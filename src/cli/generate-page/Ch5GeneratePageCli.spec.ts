// import { expect } from 'chai';
// import { Ch5GeneratePageCli } from './Ch5GeneratePageCli';
// import * as sinon from "sinon";
// import mock from 'mock-fs';
// import { Ch5CliLogger } from "../Ch5CliLogger";
// import { SinonStub } from "sinon";

// const generatePageComponent = new Ch5GeneratePageCli();

// describe('Generate page >>>>>>>> ', () => {
//     let loggerPrintWarningStub: SinonStub;
//     let loggerPrintErrorStub: SinonStub;
//     let loggerPrintSuccessStub: SinonStub;

//     before(() => {
//         mock();
//     });

//     after(() => {
//         mock.restore();
//     });

//     beforeEach(() => {
//         loggerPrintWarningStub = sinon.stub(Ch5CliLogger.prototype, 'printWarning');
//         loggerPrintErrorStub = sinon.stub(Ch5CliLogger.prototype, 'printError');
//         loggerPrintSuccessStub = sinon.stub(Ch5CliLogger.prototype, 'printSuccess');
//         // Mock external enquirer library
//         sinon.stub(Ch5GeneratePageCli.prototype, 'getEnquirer').get(() => {
//             return {
//                 prompt: () => new Promise(resolve => resolve({
//                     pageName: 'page',
//                     menuOption: 'option'
//                 }))
//             }
//         })
//     });

//     afterEach(() => {
//         // Revert any stubs / mocks created using sinon
//         sinon.restore();
//     });

//     it('Expect to fail if page name already exists in project-config', async () => {
//         mock({
//             'app': {
//                 'project-config.json': JSON.stringify(mockedAppJson),
//             }
//         });

//         generatePageComponent.setInputArgsForTesting(["--name", "page1"]); // this is a dummy method to force set value of args before proceeding with the testing
//         const response = await generatePageComponent.run();
//         expect(response).to.equal(false);
//     });

//     it(`Expect certain function to be called inside run method`, async () => {
//         mock({
//             'app': {
//                 'project-config.json': JSON.stringify(mockedAppJson),
//             },
//             'build': {
//                 'cli': {
//                     'generate-page': {
//                         'templates': {
//                             'html.template': '',
//                             'js.template': '',
//                             'scss.template': '',
//                             'emulator.template': ''
//                         }
//                     }
//                 }
//             }
//         });
//         const initializeSpy = sinon.spy(generatePageComponent, <any>'initialize');
//         const verifyInputSpy = sinon.spy(generatePageComponent, <any>'verifyInputParams');
//         const checkPromptQuestionSpy = sinon.spy(generatePageComponent, <any>'checkPromptQuestions');
//         const processRequestSpy = sinon.spy(generatePageComponent, <any>'processRequest');
//         const cleanUpSpy = sinon.spy(generatePageComponent, <any>'cleanUp');

//         generatePageComponent.setInputArgsForTesting(["--name", "page88"]); // this is a dummy method to force set value of args before proceeding with the testing
//         const response = await generatePageComponent.run();
//         expect(response).to.equal(true);

//         sinon.assert.callOrder(initializeSpy, verifyInputSpy, checkPromptQuestionSpy, processRequestSpy, cleanUpSpy);
//     });

//     it(`Expect to trigger error if template files are missing`, async () => {
//         mock({
//             'app': {
//                 'project-config.json': JSON.stringify(mockedAppJson),
//             }
//         });
//         const initializeSpy = sinon.spy(generatePageComponent, <any>'initialize');
//         const verifyInputSpy = sinon.spy(generatePageComponent, <any>'verifyInputParams');
//         const checkPromptQuestionSpy = sinon.spy(generatePageComponent, <any>'checkPromptQuestions');
//         const processRequestSpy = sinon.spy(generatePageComponent, <any>'processRequest');

//         generatePageComponent.setInputArgsForTesting(["--name", "page88"]); // this is a dummy method to force set value of args before proceeding with the testing
//         const response = await generatePageComponent.run();
//         expect(response).to.equal(false);

//         sinon.assert.callOrder(initializeSpy, verifyInputSpy, checkPromptQuestionSpy, processRequestSpy);
//     });
// });



// const mockedAppJson = {
//     "projectName": "Shell-Template",
//     "version": "0.0.1",
//     "faviconPath": "favicon.ico",
//     "menuOrientation": "horizontal",
//     "selectedTheme": "light-theme",
//     "useWebXPanel": true,
//     "themes": [
//       {
//         "name": "light-theme",
//         "brandLogo": {
//           "url": "./app/template/assets/img/ch5-logo-light.svg",
//           "alt": "Crestron Logo",
//           "receiveStateUrl": ""
//         },
//         "backgroundProperties": {
//           "url": [
//             "./app/template/assets/img/ch5-stone-light-bg.jpg"
//           ]
//         }
//       },
//       {
//         "name": "dark-theme",
//         "brandLogo": {
//           "url": "./app/template/assets/img/ch5-logo-dark.svg",
//           "alt": "Crestron Logo",
//           "receiveStateUrl": ""
//         },
//         "backgroundProperties": {
//           "url": [
//             "./app/template/assets/img/ch5-stone-dark-bg.jpg"
//           ]
//         }
//       },
//       {
//         "name": "project-light-theme",
//         "brandLogo": {
//           "url": "./app/template/assets/img/ch5-logo-light.svg",
//           "alt": "Crestron Logo",
//           "receiveStateUrl": ""
//         },
//         "backgroundProperties": {
//           "url": [
//             "./app/template/assets/img/ch5-stone-light-bg.jpg"
//           ]
//         }
//       },
//       {
//         "name": "project-dark-theme",
//         "brandLogo": {
//           "url": "./app/template/assets/img/ch5-logo-dark.svg",
//           "alt": "Crestron Logo",
//           "receiveStateUrl": ""
//         },
//         "backgroundProperties": {
//           "url": [
//             "./app/template/assets/img/ch5-stone-dark-bg.jpg"
//           ]
//         }
//       },
//       {
//         "name": "project-custom-theme",
//         "brandLogo": {
//           "url": "./app/template/assets/img/ch5-logo-light.svg",
//           "alt": "Crestron Logo",
//           "receiveStateUrl": ""
//         },
//         "backgroundProperties": {
//           "url": [
//             "./app/template/assets/img/ch5-stone-light-bg.jpg"
//           ]
//         }
//       }
//     ],
//     "config": {
//       "controlSystem": {}
//     },
//     "header": {
//       "display": true,
//       "displayInfo": true,
//       "$component": ""
//     },
//     "footer": {
//       "display": true,
//       "$component": ""
//     },
//     "content": {
//       "$defaultView": "page1",
//       "triggerViewProperties": {
//         "gestureable": true
//       },
//       "pages": [
//         {
//           "pageName": "page1",
//           "fullPath": "./app/project/components/pages/page1/",
//           "fileName": "page1.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 1,
//             "label": "menu.page1",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         },
//         {
//           "pageName": "page2",
//           "fullPath": "./app/project/components/pages/page2/",
//           "fileName": "page2.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 2,
//             "label": "menu.page2",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         },
//         {
//           "pageName": "page3",
//           "fullPath": "./app/project/components/pages/page3/",
//           "fileName": "page3.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 3,
//             "label": "menu.page3",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         },
//         {
//           "pageName": "page4",
//           "fullPath": "./app/project/components/pages/page4/",
//           "fileName": "page4.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 4,
//             "label": "menu.page4",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         },
//         {
//           "pageName": "page5",
//           "fullPath": "./app/project/components/pages/page5/",
//           "fileName": "page5.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 5,
//             "label": "menu.page5",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         },
//         {
//           "pageName": "page6",
//           "fullPath": "./app/project/components/pages/page6/",
//           "fileName": "page6.html",
//           "standAloneView": false,
//           "navigation": {
//             "sequence": 6,
//             "label": "menu.page6",
//             "isI18nLabel": true,
//             "iconClass": "fas fa-file-alt",
//             "iconUrl": "",
//             "iconPosition": "bottom"
//           }
//         }
//       ],
//       "widgets": [
//         {
//           "widgetName": "pagedisplay",
//           "fullPath": "./app/project/components/widgets/pagedisplay/",
//           "fileName": "pagedisplay.html"
//         }
//       ]
//     }
//   }
