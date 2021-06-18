import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ExportAssetsCli} from "./Ch5ExportAssetsCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const exportAssetsComponent = new Ch5ExportAssetsCli();

describe('Export an asset >>>>>>>> ', () => {
  let loggerPrintErrorStub: SinonStub;
  let loggerPrintSuccessStub: SinonStub;
  let deleteFileStub: SinonStub;
  let deleteFolderStub: SinonStub;
  let mkdirSyncSpy: SinonSpy;
  let copySyncSpy: SinonSpy;
  let copyAndZipFilesSpy: SinonSpy;
  let existsSyncSpy: SinonSpy;

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
    copyAndZipFilesSpy = sinon.spy(Ch5ExportAssetsCli.prototype, 'copyAndZipFiles');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect export asset to print error if no argument are provided`, async () => {
    const response = await exportAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export assets.')).equals(true);
  });

  it('Expect export asset to print error if arguments are unknown', async () => {
    exportAssetsComponent.setInputArgsForTesting(['--test']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export assets.')).equals(true);
  });

  it('Expect export asset to print error if directory does not exist and argument is all', async () => {
    exportAssetsComponent.setInputArgsForTesting(['--all']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The directory does not exist.')).equals(true);
  });

  it('Expect export component to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'app/project/assets': {}
    });
    exportAssetsComponent.setInputArgsForTesting(['--all']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The are no files to export in the directory.')).equals(true);
  });
  //
  it('Expect export component to export components -- all', async () => {
    mock({
      'app/project/assets/data/translation': {
        'en.json': '{}'
      }
    });
    exportAssetsComponent.setInputArgsForTesting(['--all']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! All the project assets are exported to \'dist\\exported-assets.zip\'.')).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
  });

  it('Expect export component to follow certain function calls --all', async () => {
    mock({
      'app/project/assets/data/translation': {
        'en.json': '{}'
      }
    });
    exportAssetsComponent.setInputArgsForTesting(['--all']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, copySyncSpy, deleteFolderStub);
  });

  it('Expect export component to export certain libraries -l /valid/path', async () => {
    mock({
      'app/project/assets': {
        'data': {
          'translation': {
            'en.json': '{}'
          }
        },
        'scss': {
          'main.scss': ''
        }
      }
    });
    exportAssetsComponent.setInputArgsForTesting(['-l', './app/project/assets/data/translation/en.json', './app/project/assets/scss/main.scss']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/assets/data/translation/en.json', './app/project/assets/scss/main.scss'], false)).equals(true);
  });

  it('Expect export component to export certain components -l /invalid/path', async () => {
    mock({
      'app/project/assets': {
        'data': {
          'translation': {
            'en.json': '{}'
          }
        }
      }
    });
    exportAssetsComponent.setInputArgsForTesting(['-l', './app/project/assets/data/translation/de.json', './app/project/assets/scss/main.scss']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(false);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/assets/data/translation/de.json', './app/project/assets/scss/main.scss'], false)).equals(true);
    expect(loggerPrintErrorStub.calledWith('Export Assets failed. The input filenames provided are either invalid or they do not exist in the assets folder.')).equals(true);
  });

  it('Expect export component to export certain components -l /valid/path /invalid/path', async () => {
    mock({
      'app/project/assets': {
        'data': {
          'translation': {
            'en.json': '{}'
          }
        }
      }
    });
    exportAssetsComponent.setInputArgsForTesting(['-l', './app/project/assets/data/translation/en.json', './app/project/assets/scss/main.scss']);
    const response = await exportAssetsComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/assets/data/translation/en.json', './app/project/assets/scss/main.scss'], false)).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! The project assets \'./app/project/assets/data/translation/en.json\' are exported to \'dist\\exported-assets.zip\'. The assets \'./app/project/assets/scss/main.scss\' are not available in the project assets folder.')).equals(true);
  });
});
