import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ImportAssetsCli} from "./Ch5ImportAssetsCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const importAssetsComponent = new Ch5ImportAssetsCli();

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
    isZipFileValidStub = sinon.stub(Ch5ImportAssetsCli.prototype, 'isZipFileValid');
    checkPromptQuestionsStub = sinon.stub(Ch5ImportAssetsCli.prototype, 'checkPromptQuestions');
    getZlStub = sinon.stub(Ch5ImportAssetsCli.prototype, 'getZl');
    mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
    copySyncSpy = sinon.spy(fsExtra, 'copySync');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
    cleanupSpy = sinon.spy(Ch5ImportAssetsCli.prototype, 'cleanUp');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect import assets to print error if no argument are provided`, async () => {
    const response = await importAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import assets is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import assets to print error if arguments are unknown', async () => {
    importAssetsComponent.setInputArgsForTesting(['--test']);
    const response = await importAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import assets is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import assets to print error if directory does not exist and argument is all', async () => {
    importAssetsComponent.setInputArgsForTesting(['--all']);
    const response = await importAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import assets is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import assets to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'dist/exported-assets.zip': {}
    });
    importAssetsComponent.setInputArgsForTesting(['-z', './dist/exported-assets.zip', '--all']);
    const response = await importAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('The zip file path to import assets is missing / invalid. Ensure add -z {path} or --zipFile {path} to the command prompt. Also, either set --all for importing all files Or set the import file paths using -l {path(s)} or --list {path(s)}.')).equals(true);
  });

  it('Expect import assets to export assets -- all', async () => {
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
        'exported-assets.zip': {
          'exported-assets': {
            'app': {
              'project': {
                'assets': {
                  'data': {
                    'translation': {
                      'en.json': '{}'
                    }
                  }
                }
              }
            }
          }
        },
        'Imported-Assets-Code-Folder-Temp': {
          'exported-assets': {
            'app': {
              'project': {
                'assets': {
                  'data': {
                    'translation': {
                      'en.json': '{}'
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    importAssetsComponent.setInputArgsForTesting(['-z', './dist/exported-assets.zip', '--all']);
    const response = await importAssetsComponent.run();
    expect(response).equals(true);
    expect(cleanupSpy.called).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! All the project assets are successfully imported.'));
  });
});
