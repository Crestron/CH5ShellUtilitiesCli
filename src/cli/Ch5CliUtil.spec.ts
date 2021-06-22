import {expect} from 'chai';
import * as sinon from 'sinon';
import {SinonSpy, SinonStub} from 'sinon';
import mock from 'mock-fs';
import {Ch5CliUtil} from "./Ch5CliUtil";
import chalk from "chalk";
import {OutputLevel} from "@crestron/ch5-utilities";

const fs = require('fs');
const fsExtra = require('fs-extra');

const ch5utils = new Ch5CliUtil();

describe('Ch5 CLI Utils >>>>>>>> ', () => {
  let consoleLogStub: SinonStub;
  before(() => {
    mock();
  });


  after(() => {
    mock.restore();
  });

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    // Revert any stubs / mocks created using sinon
    sinon.restore();
  });

  it(`write error`, () => {
    ch5utils.writeError(new Error('message'));
    expect(consoleLogStub.calledWith(chalk.red(`Error: message`))).equals(true);
  });

  it ('get output level - quiet', () => {
    const outputLevel = ch5utils.getOutputLevel({quiet: true});
    expect(outputLevel).equals(OutputLevel.Quiet);
  });

  it ('get output level - verbose', () => {
    const outputLevel = ch5utils.getOutputLevel({verbose: true});
    expect(outputLevel).equals(OutputLevel.Verbose);
  });

  it ('get output level - normal', () => {
    const outputLevel = ch5utils.getOutputLevel({other: true});
    expect(outputLevel).equals(OutputLevel.Normal);
  });

  it('is valid input - empty string', () => {
    const response = ch5utils.isValidInput('');
    expect(response).equals(false);
  });

  it('is valid input - undefined', () => {
    const response = ch5utils.isValidInput(undefined);
    expect(response).equals(false);
  });

  it('is valid input - null', () => {
    const response = ch5utils.isValidInput(null);
    expect(response).equals(false);
  });

  it('is valid input - valid scenarios', () => {
    expect(ch5utils.isValidInput(['asd'])).equals(true);
    expect(ch5utils.isValidInput([21])).equals(true);
    expect(ch5utils.isValidInput(1)).equals(true);
    expect(ch5utils.isValidInput('asd')).equals(true);
    expect(ch5utils.isValidInput({asd: true})).equals(true);
  });

  it ('is valid object - invalid scenarios', () => {
    expect(ch5utils.isValidObject(null)).equals(false);
    expect(ch5utils.isValidObject(['asd'])).equals(false);
    expect(ch5utils.isValidObject(undefined)).equals(false);
    expect(ch5utils.isValidObject([{'asd': true}])).equals(false);
  });

  it('is valid object - valid scenarios', () => {
    expect(ch5utils.isValidObject({'asd': true})).equals(true);
    expect(ch5utils.isValidObject({})).equals(true);
  });

  it('convert array to string', () => {
    expect(ch5utils.convertArrayToString(['asd', 'xcv', 'ppt'])).equals('asd,xcv,ppt');
  });

  it ('convert string too boolean', () => {
    expect(ch5utils.convertStringToBoolean('n')).equals(false);
    expect(ch5utils.convertStringToBoolean('y')).equals(true);
  });

  it('deep copy', () => {
    const object = {
      prop: 'val'
    };
    expect(ch5utils.deepCopy(object)).not.equals(object);
  });

  it('replace all', () => {
    expect(ch5utils.replaceAll('lorem ipsum text', 'psu', 'ppt')).equals('lorem ipptm text');
    expect(ch5utils.replaceAll('', 'psu', 'ppt')).equals('');
  });

});
