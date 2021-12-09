import { expect } from 'chai';
import * as sinon from 'sinon';
import mock from 'mock-fs';
import { Ch5CliProjectConfig } from "./Ch5CliProjectConfig";

const ch5projectConfig = new Ch5CliProjectConfig();

describe('Ch5 CLI Project Config >>>>>>>> ', () => {
  before(() => {
    mock({
      'app': {
        'project-config.json': JSON.stringify(mockedAppJson),
      }
    });
  });


  after(() => {
    mock.restore();
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`get json`, () => {
    expect(JSON.stringify(ch5projectConfig.getJson())).equals(JSON.stringify(mockedAppJson));
  });


  it(`get all pages`, () => {
    expect(JSON.stringify(ch5projectConfig.getAllPages())).equals(JSON.stringify(mockedAppJson.content.pages));
  });

  it(`get all widgets`, () => {
    expect(JSON.stringify(ch5projectConfig.getAllWidgets())).equals(JSON.stringify(mockedAppJson.content.widgets));
  });

  it(`get all pages and widgets`, () => {
    const output = [];
    for (let i: number = 0; i < mockedAppJson.content.pages.length; i++) {
      output.push({ index: i, name: mockedAppJson.content.pages[i].pageName, component: mockedAppJson.content.pages[i], type: "page" });
    }
    for (let i: number = 0; i < mockedAppJson.content.widgets.length; i++) {
      output.push({ index: i + mockedAppJson.content.pages.length, name: mockedAppJson.content.widgets[i].widgetName, component: mockedAppJson.content.widgets[i], type: "widget" });
    }

    expect(JSON.stringify(ch5projectConfig.getAllPagesAndWidgets())).equals(JSON.stringify(output));
  });

  it('Get all navigation', () => {
    expect(JSON.stringify(ch5projectConfig.getAllNavigations())).equals(JSON.stringify(mockedAppJson.content.pages));
  });

  it('Get highest navigation', () => {
    expect(ch5projectConfig.getHighestNavigationSequence()).equals(mockedAppJson.content.pages[5].navigation.sequence);
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
          "sendEventOnShow": ""
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
          "sendEventOnShow": ""
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
          "sendEventOnShow": ""
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
          "sendEventOnShow": ""
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
          "sendEventOnShow": ""
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
          "sendEventOnShow": ""
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
};
