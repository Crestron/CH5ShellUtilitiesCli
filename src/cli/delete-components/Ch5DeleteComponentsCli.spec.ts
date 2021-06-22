import { expect } from 'chai';
import * as sinon from "sinon";
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {SinonStub} from "sinon";
import {Ch5DeleteComponentsCli} from "./Ch5DeleteComponentsCli";

const deleteComponents = new Ch5DeleteComponentsCli();

describe('Delete components >>>>>>>> ', () => {
    let loggerPrintWarningStub: SinonStub;
    let loggerPrintErrorStub: SinonStub;
    let loggerPrintSuccessStub: SinonStub;

    beforeEach(() => {
        mock({
            'app': {
                'project-config.json': JSON.stringify(mockedAppJson),
            }
        });
        loggerPrintWarningStub = sinon.stub(Ch5CliLogger.prototype, 'printWarning');
        loggerPrintErrorStub = sinon.stub(Ch5CliLogger.prototype, 'printError');
        loggerPrintSuccessStub = sinon.stub(Ch5CliLogger.prototype, 'printSuccess');
        // Mock external enquirer library
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getEnquirer').get(() => {
            return {
                prompt: () =>  new Promise(resolve => resolve({}))
            }
        });
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getMultiSelect').get(() => () => {
            return {
                run: () => new Promise(resolve => resolve({}))
            }
        })
    });

    afterEach(() => {
        mock.restore();
        // Revert any stubs / mocks created using sinon
        sinon.restore();
    });

    it('Delete components without parameters - trigger error if no components have been selected', async () => {
        const response = await deleteComponents.run();
        expect(response).to.equal(false);
        expect(loggerPrintErrorStub.calledWith('No components have been selected for deletion.'));
    });

    it('Delete components without parameters - with components selected, no confirmation', async () => {
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getMultiSelect').get(() => () => {
            return {
                run: () => new Promise(resolve => resolve([{component: 'component'}]))
            }
        });

        const response = await deleteComponents.run();
        expect(response).to.equal(false);
        expect(loggerPrintErrorStub.calledWith('Process terminated since you do not wish to delete the selected components.')).equals(true);
    });

    it('Delete components without parameters - with components selected, with confirmation', async () => {
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getMultiSelect').get(() => () => {
            return {
                run: () => new Promise(resolve => resolve(['page1']))
            }
        });
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getEnquirer').get(() => {
            return {
                prompt: () =>  new Promise(resolve => resolve({
                    deleteConfirmation: 'y'
                }))
            }
        });

        const response = await deleteComponents.run();
        expect(response).to.equal(true);
    });

    it('Delete components with and confirmation', async () => {
        deleteComponents.setInputArgsForTesting(['--list', 'page1']); // this is a dummy method to force set value of args before proceeding with the testing
        sinon.stub(Ch5DeleteComponentsCli.prototype, 'getEnquirer').get(() => {
            return {
                prompt: () =>  new Promise(resolve => resolve({
                    deleteConfirmation: 'y'
                }))
            }
        });

        const response = await deleteComponents.run();
        expect(response).to.equal(true);
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
            "path": "./assets/theme/light.css",
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
            "path": "./assets/theme/dark.css",
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
            "name": "custom-theme",
            "path": "./assets/theme/custom.css",
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
                    "class": ""
                },
                "navigation": {
                    "sequence": 1,
                    "label": "menu.page1",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
                    "iconPosition": "bottom"
                }
            },
            {
                "pageName": "page2",
                "fullPath": "./app/project/components/pages/page2/",
                "fileName": "page2.html",
                "standAloneView": false,
                "pageProperties": {
                    "class": ""
                },
                "navigation": {
                    "sequence": 2,
                    "label": "menu.page2",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
                    "iconPosition": "bottom"
                }
            },
            {
                "pageName": "page3",
                "fullPath": "./app/project/components/pages/page3/",
                "fileName": "page3.html",
                "standAloneView": false,
                "pageProperties": {
                    "class": ""
                },
                "navigation": {
                    "sequence": 3,
                    "label": "menu.page3",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
                    "iconPosition": "bottom"
                }
            },
            {
                "pageName": "page4",
                "fullPath": "./app/project/components/pages/page4/",
                "fileName": "page4.html",
                "standAloneView": false,
                "pageProperties": {
                    "class": ""
                },
                "navigation": {
                    "sequence": 4,
                    "label": "menu.page4",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
                    "iconPosition": "bottom"
                }
            },
            {
                "pageName": "page5",
                "fullPath": "./app/project/components/pages/page5/",
                "fileName": "page5.html",
                "standAloneView": false,
                "pageProperties": {
                    "class": ""
                },
                "navigation": {
                    "sequence": 5,
                    "label": "menu.page5",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
                    "iconPosition": "bottom"
                }
            },
            {
                "pageName": "page6",
                "fullPath": "./app/project/components/pages/page6/",
                "fileName": "page6.html",
                "standAloneView": false,
                "pageProperties": {
                    "class": ""
                },
                "navigation": {
                    "sequence": 6,
                    "label": "menu.page6",
                    "isI18nLabel": true,
                    "iconClass": "",
                    "iconUrl": "./app/project/assets/img/navigation/page.svg",
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
