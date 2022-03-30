import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonSpy, SinonStub } from 'sinon';
import mock from 'mock-fs';
import { Ch5CliUtil } from "./Ch5CliUtil";
import chalk from "chalk";
import { OutputLevel } from "@crestron/ch5-utilities";

const ch5utils = new Ch5CliUtil();

describe('Ch5 CLI Utils >>>>>>>>', () => {

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

  describe('Method: writeError()', () => {

    it(`write error`, () => {
      ch5utils.writeError(new Error('message'));
      expect(consoleLogStub.calledWith(chalk.red(`Error: message`))).equals(true);
    });

  });

  describe('Method: dynamicSort()', () => {

    it('get output level - quiet', () => {
      const arrayToBeSorted = [{ item: "hello" }, { item: "one" }, { item: "ace" }, { item: "ten" }, { item: "bowl" }, { item: "zebra" }];
      expect(arrayToBeSorted.sort(ch5utils.dynamicSort("asc", "item"))).deep.equal([{ item: "ace" }, { item: "bowl" }, { item: "hello" }, { item: "one" }, { item: "ten" }, { item: "zebra" }]);
    });

  });

  describe('Method: isValidInput()', () => {

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
      expect(ch5utils.isValidInput({ asd: true })).equals(true);
    });

  });

  describe('Method: isValidObject()', () => {

    it('is valid object - invalid scenarios', () => {
      expect(ch5utils.isValidObject(null)).equals(false);
      expect(ch5utils.isValidObject(['asd'])).equals(false);
      expect(ch5utils.isValidObject(undefined)).equals(false);
      expect(ch5utils.isValidObject([{ 'asd': true }])).equals(false);
    });

    it('is valid object - valid scenarios', () => {
      expect(ch5utils.isValidObject({ 'asd': true })).equals(true);
      expect(ch5utils.isValidObject({})).equals(true);
    });

  });

  describe('Method: convertArrayToString()', () => {

    it('convert array to string', () => {
      expect(ch5utils.convertArrayToString(['asd', 'xcv', 'ppt'])).equals('asd,xcv,ppt');
    });

  });

  describe('Method: convertStringToBoolean()', () => {

    it('convert string too boolean', () => {
      expect(ch5utils.convertStringToBoolean('n')).equals(false);
      expect(ch5utils.convertStringToBoolean('y')).equals(true);
    });

  });

  describe('Method: replaceAll()', () => {

    it('replace all', () => {
      expect(ch5utils.replaceAll('lorem ipsum text', 'psu', 'ppt')).equals('lorem ipptm text');
      expect(ch5utils.replaceAll('', 'psu', 'ppt')).equals('');
    });

  });

  describe('Method: toBoolean()', () => {

    it('convert to boolean', () => {
      expect(ch5utils.toBoolean('Y')).equals(true);
      expect(ch5utils.toBoolean('y')).equals(true);
      expect(ch5utils.toBoolean('N')).equals(false);
      expect(ch5utils.toBoolean('n')).equals(false);
      expect(ch5utils.toBoolean('1')).equals(true);
      expect(ch5utils.toBoolean('0')).equals(false);
      expect(ch5utils.toBoolean(1)).equals(true);
      expect(ch5utils.toBoolean(0)).equals(false);
      expect(ch5utils.toBoolean('true')).equals(true);
      expect(ch5utils.toBoolean('false')).equals(false);
      expect(ch5utils.toBoolean(true)).equals(true);
      expect(ch5utils.toBoolean(false)).equals(false);
    });

  });

  describe('Method: readdirAsync()', () => {

  });

  describe('Method: deleteFolder()', () => {

  });

  describe('Method: deleteFile()', () => {

  });

  describe('Method: readFileContent()', () => {

  });

  describe('Method: readFileContentSync()', () => {

  });

  describe('Method: readFile()', () => {

  });

  describe('Method: getText()', () => {

  });

});