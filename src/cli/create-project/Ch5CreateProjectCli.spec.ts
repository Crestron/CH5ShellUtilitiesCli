import { expect } from 'chai';
import { Ch5CreateProjectCli } from './Ch5CreateProjectCli';
import * as sinon from "sinon";
import mock from 'mock-fs';
import { Ch5CliLogger } from "../Ch5CliLogger";
import { SinonStub } from "sinon";

const createProject = new Ch5CreateProjectCli();

describe('Create Project >>>>>>>> ', () => {

  before(() => {
    mock();
  });

  after(() => {
    mock.restore();
  });

  beforeEach(() => {

  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  describe('Test Functions >>>>>>>> ', () => {

    it('Expect to fail if page name already exists in project-config', () => {
      createProject.checkVersionToExecute();
      // expect(response).to.equal(false);
    });

  });

});
