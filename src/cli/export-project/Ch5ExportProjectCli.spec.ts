import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5ExportProjectCli} from "./Ch5ExportProjectCli";
import {Ch5CliUtil} from "../Ch5CliUtil";
import {Ch5CliNamingHelper} from "../Ch5CliNamingHelper";

const fs = require('fs');
const fsExtra = require('fs-extra');

const exportProjectComponent = new Ch5ExportProjectCli();

describe('Export a project >>>>>>>> ', () => {
  let deleteFileStub: SinonStub;
  let copyFilesSpy: SinonSpy;
  let createTempFolderSpy: SinonSpy;
  let removeAllSpacesSpy: SinonSpy;
  before(() => {
    // Mock the fs and provide a mocked package.json
    mock({
      'package.json': '{"name":"@crestron/ch5-shell-utilities-cli"}'
    });
  });


  after(() => {
    mock.restore();
  });

  beforeEach(() => {
    // Mock functions which gets called inside exportProjectComponent.run so they are not actually called
    deleteFileStub = sinon.stub(Ch5CliUtil.prototype, 'deleteFile');
    removeAllSpacesSpy = sinon.spy(Ch5CliNamingHelper.prototype, 'removeAllSpaces');
    copyFilesSpy = sinon.spy(exportProjectComponent, 'copyFiles');
    createTempFolderSpy = sinon.spy(exportProjectComponent, 'createTempFolder');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`Expect export project to return true`, async () => {
    const response = await exportProjectComponent.run();
    expect(response).equals(true);
  });

  it('Expect file names to equal project name', async () => {
    const readJSONSyncSpy = sinon.spy(fsExtra, 'readJSONSync');

    await exportProjectComponent.run();

    expect(readJSONSyncSpy.called).equals(true);
    expect(removeAllSpacesSpy.called).equals(true);
    expect(removeAllSpacesSpy.calledWith('@crestron/ch5-shell-utilities-cli'));
    expect(createTempFolderSpy.calledWith('@crestron/ch5-shell-utilities-cli-Code-Folder-Temp'));
  });

  it('Expect functions to be called in certain order', async () => {
    await exportProjectComponent.run();
    sinon.assert.callOrder(removeAllSpacesSpy, deleteFileStub, createTempFolderSpy, copyFilesSpy);
  })
});
