import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ImportAllCli} from "./Ch5ImportAllCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const importAllComponent = new Ch5ImportAllCli();

describe('Import an asset >>>>>>>> ', () => {
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
    isZipFileValidStub = sinon.stub(Ch5ImportAllCli.prototype, 'isZipFileValid');
    checkPromptQuestionsStub = sinon.stub(Ch5ImportAllCli.prototype, 'checkPromptQuestions');
    getZlStub = sinon.stub(Ch5ImportAllCli.prototype, 'getZl');
    mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
    copySyncSpy = sinon.spy(fsExtra, 'copySync');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
    cleanupSpy = sinon.spy(Ch5ImportAllCli.prototype, 'cleanUp');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect import all to print error if no argument are provided`, async () => {
    const response = await importAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import all is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import all to print error if arguments are unknown', async () => {
    importAllComponent.setInputArgsForTesting(['--test']);
    const response = await importAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import all is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import all to print error if directory does not exist and argument is all', async () => {
    importAllComponent.setInputArgsForTesting(['--all']);
    const response = await importAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import all is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import all to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'dist/exported-all.zip': {}
    });
    importAllComponent.setInputArgsForTesting(['-z', './dist/exported-all.zip', '--all']);
    const response = await importAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import all is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import all to export all -- all', async () => {
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
        'exported-all.zip': {
          'exported-all': {
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
        'Imported-All-Code-Folder-Temp': {
          'exported-all': {
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
    importAllComponent.setInputArgsForTesting(['-z', './dist/exported-all.zip', '--all']);
    const response = await importAllComponent.run();
    expect(response).equals(true);
    // expect(cleanupSpy.called).equals(true);
    // expect(loggerPrintSuccessStub.calledWith('Congratulations! All the project assets, libraries, and components are successfully imported.'));
  });
});
