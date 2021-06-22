import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5ExportAllCli} from "./Ch5ExportAllCli";

const fs = require('fs');
const fsExtra = require('fs-extra');

const exportAllComponent = new Ch5ExportAllCli();

describe('Export all >>>>>>>> ', () => {
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
    copyAndZipFilesSpy = sinon.spy(Ch5ExportAllCli.prototype, 'copyAndZipFiles');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
    writeJsonSyncSpy = sinon.spy(fsExtra, 'writeJsonSync');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect export all to print error if no argument are provided`, async () => {
    const response = await exportAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export all.')).equals(true);
  });

  it('Expect export all to print error if arguments are unknown', async () => {
    exportAllComponent.setInputArgsForTesting(['--test']);
    const response = await exportAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export all.')).equals(true);
  });

  it('Expect export all to print error if directory does not exist and argument is all', async () => {
    exportAllComponent.setInputArgsForTesting(['--all']);
    const response = await exportAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The directory does not exist.')).equals(true);
  });

  it('Expect export all to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'app/project': {}
    });
    exportAllComponent.setInputArgsForTesting(['--all']);
    const response = await exportAllComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The are no files to export in the directory.')).equals(true);
  });

  it('Expect export all to export all -- all', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: []
          }
        }),
        'project': {
          'libraries': {
            'a.js': ''
          }
        }
      }
    });
    exportAllComponent.setInputArgsForTesting(['--all']);
    const response = await exportAllComponent.run();
    expect(response).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! \'./app/project\' folder exported to \'dist\\exported-all.zip\'.')).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
  });

  it('Expect export all to follow certain function calls --all', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {
            pages: []
          }
        }),
        'project': {
          'libraries': {
            'a.js': ''
          }
        }
      }
    });
    exportAllComponent.setInputArgsForTesting(['--all']);
    const response = await exportAllComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, copySyncSpy, writeJsonSyncSpy, deleteFolderStub);
  });

  it('Expect export all to export certain libraries -l /valid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {pages: []}
        }),
        'project': {
          'libraries': {
            'a.js': '',
            'b.js': '',
          }
        }
      }
    });
    exportAllComponent.setInputArgsForTesting(['-l', './app/project/libraries/a.js', './app/project/libraries/b.js']);
    const response = await exportAllComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/a.js', './app/project/libraries/b.js'], false)).equals(true);
  });

  it('Expect export all to export certain libraries -l /invalid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {pages: []}
        }),
        'project': {
          'libraries': {
            'x.js': '',
            'd.js': '',
          }
        }
      }
    });
    exportAllComponent.setInputArgsForTesting(['-l', './app/project/libraries/a.js', './app/project/libraries/b.js']);
    const response = await exportAllComponent.run();
    expect(response).equals(false);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/a.js', './app/project/libraries/b.js'], false)).equals(true);
    expect(loggerPrintErrorStub.calledWith('Export All failed. The input filenames provided are either invalid or they do not exist in the \'./app/project\' folder.')).equals(true);
  });

  it('Expect export all to export certain libraries -l /valid/path /invalid/path', async () => {
    mock({
      'app': {
        'project-config.json': JSON.stringify({
          content: {pages: []}
        }),
        'project': {
          'libraries': {
            'a.js': '',
            'd.js': '',
          }
        }
      }
    });
    exportAllComponent.setInputArgsForTesting(['-l', './app/project/libraries/a.js', './app/project/libraries/b.js']);
    const response = await exportAllComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/a.js', './app/project/libraries/b.js'], false)).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! The selected files \'./app/project/libraries/a.js\' are exported to \'dist\\exported-all.zip\'. The files \'./app/project/libraries/b.js\' are not available in the \'./app/project\' folder.')).equals(true);
  });
});
