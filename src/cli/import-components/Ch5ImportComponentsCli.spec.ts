import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ImportComponentsCli} from "./Ch5ImportComponentsCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const importComponentComponent = new Ch5ImportComponentsCli();

describe('Import a component >>>>>>>> ', () => {
  let loggerPrintErrorStub: SinonStub;
  let loggerPrintSuccessStub: SinonStub;
  let deleteFileStub: SinonStub;
  let deleteFolderStub: SinonStub;
  let isZipFileValidStub: SinonStub;
  let checkPromptQuestionsStub: SinonStub;
  let getZlStub: SinonStub;
  let mkdirSyncSpy: SinonSpy;
  let copySyncSpy: SinonSpy;
  let existsSyncSpy: SinonSpy;
  let cleanupSpy: SinonSpy;


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
    isZipFileValidStub = sinon.stub(Ch5ImportComponentsCli.prototype, 'isZipFileValid');
    checkPromptQuestionsStub = sinon.stub(Ch5ImportComponentsCli.prototype, 'checkPromptQuestions');
    getZlStub = sinon.stub(Ch5ImportComponentsCli.prototype, 'getZl');
    mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
    copySyncSpy = sinon.spy(fsExtra, 'copySync');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
    cleanupSpy = sinon.spy(Ch5ImportComponentsCli.prototype, 'cleanUp');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect import component to print error if no argument are provided`, async () => {
    const response = await importComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import components is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import component to print error if arguments are unknown', async () => {
    importComponentComponent.setInputArgsForTesting(['--test']);
    const response = await importComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import components is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import component to print error if directory does not exist and argument is all', async () => {
    importComponentComponent.setInputArgsForTesting(['--all']);
    const response = await importComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import components is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import library to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'dist/exported-components.zip': {}
    });
    importComponentComponent.setInputArgsForTesting(['-z', './dist/exported-components.zip', '--all']);
    const response = await importComponentComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import components is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import library to export libraries -- all', async () => {
    // Mock zl library
    getZlStub.get(() => {
      return {
        Unzip: () => {
          return {
            extract: () => new Promise(resolve => resolve(true))
          }
        }
      }
    });
    isZipFileValidStub.returns(true);
    mock({
      'dist': {
        'exported-components.zip': {
          'exported-components': {
            'app': {
              'project': {
                'components': {
                  'pages': {
                    'page1': {
                      'page1.html': ''
                    }
                  }
                }
              },
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
                  ]
                }
              })
            }
          }
        },
        'Imported-Components-Code-Folder-Temp': {
          'exported-components': {
            'app': {
              'project': {
                'components': {
                  'pages': {
                    'page1': {
                      'page1.html': ''
                    }
                  }
                }
              },
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
                  ]
                }
              })
            }
          }
        }
      }
    });
    importComponentComponent.setInputArgsForTesting(['-z', './dist/exported-components.zip', '--all']);
    const response = await importComponentComponent.run();
    // expect(response).equals(true);
    // expect(cleanupSpy.called).equals(true);
  });
});
