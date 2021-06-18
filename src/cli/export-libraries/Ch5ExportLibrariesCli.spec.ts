import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5ExportLibrariesCli} from "./Ch5ExportLibrariesCli";
import {Ch5CliLogger} from "../Ch5CliLogger";
import {Ch5CliUtil} from "../Ch5CliUtil";

const fs = require('fs');
const fsExtra = require('fs-extra');

const exportLibraryComponent = new Ch5ExportLibrariesCli();

describe('Export a library >>>>>>>> ', () => {
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
    copyAndZipFilesSpy = sinon.spy(Ch5ExportLibrariesCli.prototype, 'copyAndZipFiles');
    existsSyncSpy = sinon.spy(fs, 'existsSync');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect export library to print error if no argument are provided`, async () => {
    const response = await exportLibraryComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export libraries.')).equals(true);
  });

  it('Expect export library to print error if arguments are unknown', async () => {
    exportLibraryComponent.setInputArgsForTesting(['--test']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('There are no input filenames provided to export libraries.')).equals(true);
  });

  it('Expect export library to print error if directory does not exist and argument is all', async () => {
    exportLibraryComponent.setInputArgsForTesting(['--all']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The directory does not exist.')).equals(true);
  });

  it('Expect export library to print error if directory exists, but is empty and argument is all', async () => {
    mock({
      'app/project/libraries': {}
    });
    exportLibraryComponent.setInputArgsForTesting(['--all']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(false);
    expect(loggerPrintErrorStub.calledWith('Export failed. The are no files to export in the directory.')).equals(true);
  });

  it('Expect export library to export libraries -- all', async () => {
    mock({
      'app/project/libraries': {
        'a.js': 'console.log("test")'
      }
    });
    exportLibraryComponent.setInputArgsForTesting(['--all']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(true);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! All the project libraries are exported to \'dist\\exported-library.zip\'.')).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
  });

  it('Expect export library to follow certain function calls --all', async () => {
    mock({
      'app/project/libraries': {
        'a.js': 'console.log("test")'
      }
    });
    exportLibraryComponent.setInputArgsForTesting(['--all']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith([], true)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, copySyncSpy, deleteFolderStub);
  });

  it('Expect export library to export certain libraries -l /valid/path', async () => {
    mock({
      'app/project/libraries': {
        'a.js': 'console.log("test")',
        'b.js': 'console.log("test")'
      }
    });
    exportLibraryComponent.setInputArgsForTesting(['-l', './app/project/libraries/a.js', './app/project/libraries/b.js']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/a.js', './app/project/libraries/b.js'], false)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, existsSyncSpy, copySyncSpy, existsSyncSpy, copySyncSpy, deleteFolderStub);
  });

  it('Expect export library to export certain libraries -l /invalid/path', async () => {
    mock({
      'app/project/libraries': {
        'a.js': 'console.log("test")',
        'b.js': 'console.log("test")'
      }
    });
    exportLibraryComponent.setInputArgsForTesting(['-l', './app/project/libraries/x.js', './app/project/libraries/c.js']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(false);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/x.js', './app/project/libraries/c.js'], false)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, existsSyncSpy, existsSyncSpy, deleteFolderStub);
    expect(loggerPrintErrorStub.calledWith('Export Library failed. The input filenames provided are either invalid or they do not exist in the libraries folder.')).equals(true);
  });

  it('Expect export library to export certain libraries -l /valid/path /invalid/path', async () => {
    mock({
      'app/project/libraries': {
        'a.js': 'console.log("test")',
        'b.js': 'console.log("test")'
      }
    });
    exportLibraryComponent.setInputArgsForTesting(['-l', './app/project/libraries/a.js', './app/project/libraries/c.js']);
    const response = await exportLibraryComponent.run();
    expect(response).equals(true);
    expect(copyAndZipFilesSpy.calledWith(['./app/project/libraries/a.js', './app/project/libraries/c.js'], false)).equals(true);
    sinon.assert.callOrder(deleteFileStub, deleteFolderStub, mkdirSyncSpy, existsSyncSpy, copySyncSpy, existsSyncSpy, deleteFolderStub);
    expect(loggerPrintSuccessStub.calledWith('Congratulations! The project libraries \'./app/project/libraries/a.js\' are exported to \'dist\\exported-library.zip\'. The libraries \'./app/project/libraries/c.js\' are not available in the project libraries folder.')).equals(true);
  })
});
