import { expect } from 'chai';
import { Ch5CreateProjectCli } from './Ch5CreateProjectCli';
import * as sinon from "sinon";
import mock from 'mock-fs';
import { Ch5CliLogger } from "../Ch5CliLogger";
import { SinonStub } from "sinon";

describe('Create Project >>>>>>>> ', () => {

  const createProject = new Ch5CreateProjectCli();
     
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
      const response = createProject.getCLIExecutionPath();
      expect(response).to.equal(__dirname);
    });

  });

  describe('Test Workflow >>>>>>>> ', () => {

    it('Check Initial Constructor response',  async (done) => {
      // const createProject = new Ch5CreateProjectCli();
      await createProject.initialize();
      const response = createProject.getOutputResponse();
      console.log(response);
      expect(response).to.equal(__dirname);
      done();
    });

  });

});
