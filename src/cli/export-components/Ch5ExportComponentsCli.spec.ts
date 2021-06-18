import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ExportComponentsCli} from "./Ch5ExportComponentsCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const exportComponentComponent = new Ch5ExportComponentsCli();

describe('Export a component >>>>>>>> ', () => {
  let loggerPrintErrorStub: SinonStub;
  let loggerPrintSuccessStub: SinonStub;
  let deleteFileStub: SinonStub;
  let deleteFolderStub: SinonStub;
  let mkdirSyncSpy: SinonSpy;
  let copySyncSpy: SinonSpy;
  let copyAndZipFilesSpy: SinonSpy;
  let existsSyncSpy: SinonSpy;
  let writeJsonSyncSpy: SinonSpy;

  before(() => {
    mock();
  });


  after(() => {
    mock.restore();
  });

  beforeEach(() => {
    deleteFileStub = sinon.stub(Ch5CliUtil.prototype, 'deleteFile');
    deleteFolderStub = sinon.stub(Ch5CliUtil.prototype, 'deleteFolder');
    loggerPrintErrorStub = sinon.stub(Ch5CliLogger.prototype, 'printError');
    loggerPrintSuccessStub = sinon.stub(Ch5CliLogger.prototype, 'printSuccess');
    mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
    copySyncSpy = sinon.spy(fsExtra, 'copySync');
    copyAndZipFilesSpy = sinon.spy(Ch5ExportComponentsCli.prototype, 'copyAndZipFiles');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
    writeJsonSyncSpy = sinon.spy(fsExtra, 'writeJsonSync');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect export component to print error if no argument are provided`, async () => {
    const response = await exportComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export components.')).equals(true);
  });

  it('Expect export component to print error if arguments are unknown', async () => {
    exportComponentComponent.setInputArgsForTesting(['--test']);
    const response = await exportComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export components.')).equals(true);
  });

  it('Expect export component to print error if directory does not exist and argument is all', async () => {
    exportComponentComponent.setInputArgsForTesting(['--all']);
    const response = await exportComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The directory does not exist.')).equals(true);
  });

  it('Expect export component to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'app/project/components': {}
    });
    exportComponentComponent.setInputArgsForTesting(['--all']);
    const response = await exportComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The are no files to export in the directory.')).equals(true);
  });

  it('Expect export component to export components -- all', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: [
              {
                "pageName": "page1",
                "fullPath": "./app/project/components/pages/page1/",
                "fileName": "page1.html",
                "standAloneView": false,
                "pageProperties": {
                  "class": ""
                },
              }
            ],
            widgets: [
              {
                "widgetName": "pagedisplay",
                "fullPath": "./app/project/components/widgets/pagedisplay/",
                "fileName": "pagedisplay.html",
                "widgetProperties": {}
              }
            ]
          }
        }),
        'project': {
          'components': {
            'pages': {
              'page1': {
                'page1.js': '',
                'page1.html': ''
              }
            },
            'widgets': {
              'pagedisplay': {
                'pagedisplay.js': ''
              }
            }
          }
        }
      }
    });
    exportComponentComponent.setInputArgsForTesting(['--all']);
    const response = await exportComponentComponent.run();
    expect(response).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! All the project components are exported to \'dist\\exported-components.zip\'.')).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
  });

  it('Expect export component to follow certain function calls --all', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: [
              {
                "pageName": "page1",
                "fullPath": "./app/project/components/pages/page1/",
                "fileName": "page1.html",
                "standAloneView": false,
                "pageProperties": {
                  "class": ""
                },
              }
            ],
            widgets: [
              {
                "widgetName": "pagedisplay",
                "fullPath": "./app/project/components/widgets/pagedisplay/",
                "fileName": "pagedisplay.html",
                "widgetProperties": {}
              }
            ]
          }
        }),
        'project': {
          'components': {
            'pages': {
              'page1': {
                'page1.js': '',
                'page1.html': ''
              }
            },
            'widgets': {
              'pagedisplay': {
                'pagedisplay.js': ''
              }
            }
          }
        }
      }
    });
    exportComponentComponent.setInputArgsForTesting(['--all']);
    const response = await exportComponentComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, copySyncSpy, writeJsonSyncSpy, deleteFolderStub);
  });

  it('Expect export component to export certain libraries -l /valid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: [
              {
                "pageName": "page1",
                "fullPath": "./app/project/components/pages/page1/",
                "fileName": "page1.html",
                "standAloneView": false,
                "pageProperties": {
                  "class": ""
                },
              }
            ],
            widgets: [
              {
                "widgetName": "pagedisplay",
                "fullPath": "./app/project/components/widgets/pagedisplay/",
                "fileName": "pagedisplay.html",
                "widgetProperties": {}
              }
            ]
          }
        }),
        'project': {
          'components': {
            'pages': {
              'page1': {
                'page1.js': '',
                'page1.html': ''
              }
            },
            'widgets': {
              'pagedisplay': {
                'pagedisplay.js': ''
              }
            }
          }
        }
      }
    });
    exportComponentComponent.setInputArgsForTesting(['-l', './app/project/components/pages/page1/page1.html', './app/project/components/widgets/pagedisplay/pagedisplay.html']);
    const response = await exportComponentComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/components/pages/page1/page1.html', './app/project/components/widgets/pagedisplay/pagedisplay.html'], false)).equals(true);
  });

  it('Expect export component to export certain components -l /invalid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: [
              {
                "pageName": "page1",
                "fullPath": "./app/project/components/pages/page1/",
                "fileName": "page1.html",
                "standAloneView": false,
                "pageProperties": {
                  "class": ""
                },
              }
            ],
            widgets: [
              {
                "widgetName": "pagedisplay",
                "fullPath": "./app/project/components/widgets/pagedisplay/",
                "fileName": "pagedisplay.html",
                "widgetProperties": {}
              }
            ]
          }
        }),
        'project': {
          'components': {
            'pages': {
              'page1': {
                'page1.js': '',
                'page1.html': ''
              }
            },
            'widgets': {
              'pagedisplay': {
                'pagedisplay.js': ''
              }
            }
          }
        }
      }
    });
    exportComponentComponent.setInputArgsForTesting(['-l', './app/project/components/pages/page1/page2.html', './app/project/components/widgets/pagedisplay2/pagedisplay.html']);
    const response = await exportComponentComponent.run();
    expect(response).equals(false);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/components/pages/page1/page2.html', './app/project/components/widgets/pagedisplay2/pagedisplay.html'], false)).equals(true);
    expect(loggerPrintErrorStub.calledWith('Export Components failed. The input filenames provided are either invalid or they do not exist in the components folder.')).equals(true);
  });

  it('Expect export component to export certain components -l /valid/path /invalid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: [
              {
                "pageName": "page1",
                "fullPath": "./app/project/components/pages/page1/",
                "fileName": "page1.html",
                "standAloneView": false,
                "pageProperties": {
                  "class": ""
                },
              }
            ],
            widgets: [
              {
                "widgetName": "pagedisplay",
                "fullPath": "./app/project/components/widgets/pagedisplay/",
                "fileName": "pagedisplay.html",
                "widgetProperties": {}
              }
            ]
          }
        }),
        'project': {
          'components': {
            'pages': {
              'page1': {
                'page1.js': '',
                'page1.html': ''
              }
            },
            'widgets': {
              'pagedisplay': {
                'pagedisplay.js': ''
              }
            }
          }
        }
      }
    });
    exportComponentComponent.setInputArgsForTesting(['-l', './app/project/components/pages/page1/page1.html', './app/project/components/widgets/pagedisplay2/pagedisplay.html']);
    const response = await exportComponentComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/components/pages/page1/page1.html', './app/project/components/widgets/pagedisplay2/pagedisplay.html'], false)).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! The project components \'./app/project/components/pages/page1/page1.html\' are exported to \'dist\\exported-components.zip\'. The components \'./app/project/components/widgets/pagedisplay2/pagedisplay.html\' are not available in the project components folder.')).equals(true);
  });
});
