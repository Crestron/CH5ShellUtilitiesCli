import { Ch5CliLogger, LOG_LEVELS } from "./Ch5CliLogger";
import { expect } from 'chai';
import { stderr } from "process";
import * as sinon from "sinon";
import { SinonStub } from "sinon";

export const shouldCheckLoggerByLevelAndEnable = (logLevel: any, enabled: boolean) => {

  let ch5CliLoggerObject: Ch5CliLogger;

  let stdErrorStub: SinonStub;

  let consoleLogStub: SinonStub;
  let consoleWarnStub: SinonStub;
  let consoleErrorStub: SinonStub;
  let consoleInfoStub: SinonStub;
  let consoleTraceStub: SinonStub;
  let consoleGroupStartStub: SinonStub;
  let consoleGroupEndStub: SinonStub;

  beforeEach(() => {
    stdErrorStub = sinon.stub(process.stderr, 'write');

    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
    consoleInfoStub = sinon.stub(console, 'info');
    consoleTraceStub = sinon.stub(console, 'trace');
    consoleGroupStartStub = sinon.stub(console, 'group');
    consoleGroupEndStub = sinon.stub(console, 'groupEnd');
  });

  afterEach(() => {
    sinon.restore();
  });

  before(() => {
    ch5CliLoggerObject = new Ch5CliLogger(enabled, logLevel);
  });

  after(() => {

  });

  it(`linebreak`, () => {
    ch5CliLoggerObject.linebreak(2);
    expect(consoleLogStub.calledWith('\n\n')).equals(true);
  });

  it('log', () => {
    ch5CliLoggerObject.log('test');
    expect(consoleLogStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Blue, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.DEBUG ? enabled : false);
  });

  it('warn', () => {
    ch5CliLoggerObject.warn('test');
    expect(consoleWarnStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Yellow, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.WARN ? enabled : false);
  });

  it('error', () => {
    ch5CliLoggerObject.error('test');
    expect(consoleErrorStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Red, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.ERROR ? enabled : false);
  });

  it('info', () => {
    ch5CliLoggerObject.info('test');
    expect(consoleInfoStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Magenta, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.INFO ? enabled : false);
  });

  it('trace', () => {
    ch5CliLoggerObject.trace('test');
    expect(consoleTraceStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Cyan, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.TRACE ? enabled : false);
  });

  it('print success', () => {
    ch5CliLoggerObject.printSuccess('test');
    expect(consoleLogStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Green, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(true);
  });

  it('print warning', () => {
    ch5CliLoggerObject.printWarning('test');
    expect(consoleLogStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Yellow, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(true);
  });

  it('print error', () => {
    ch5CliLoggerObject.printError('test');
    expect(stdErrorStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Red + 'test' + ch5CliLoggerObject.FORMATTING.Reset + "\n")).equals(true);
  });

  it('print log', () => {
    ch5CliLoggerObject.printLog('test');
    expect(consoleLogStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Blue, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(true);
  });

  it('group start', () => {
    ch5CliLoggerObject.start('test');
    expect(consoleGroupStartStub.calledWith(ch5CliLoggerObject.FOREGROUND_COLORS.Blue, 'test', ch5CliLoggerObject.FORMATTING.Reset)).equals(logLevel <= LOG_LEVELS.DEBUG ? enabled : false);
  });

  it('group end', () => {
    ch5CliLoggerObject.end();
    expect(consoleGroupEndStub.called).equals(logLevel <= LOG_LEVELS.DEBUG ? enabled : false);
  });

  it('on error', () => {
    try {
      ch5CliLoggerObject.onErr(new Error(''));
    } catch (err) { }
    expect(consoleErrorStub.called).equals(logLevel <= LOG_LEVELS.ERROR ? enabled : false);
  });

};

describe('Ch5 CLI Logger >>>>>>>> ', () => {

  describe('LOG_LEVELS.TRACE and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.TRACE, true);
  });

  describe('LOG_LEVELS.TRACE and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.TRACE, false);
  });

  describe('LOG_LEVELS.DEBUG and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.DEBUG, true);
  });

  describe('LOG_LEVELS.DEBUG and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.DEBUG, false);
  });

  describe('LOG_LEVELS.INFO and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.INFO, true);
  });

  describe('LOG_LEVELS.INFO and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.INFO, false);
  });

  describe('LOG_LEVELS.WARN and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.WARN, true);
  });

  describe('LOG_LEVELS.WARN and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.WARN, false);
  });

  describe('LOG_LEVELS.ERROR and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.ERROR, true);
  });

  describe('LOG_LEVELS.ERROR and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.ERROR, false);
  });

  describe('LOG_LEVELS.FATAL and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.FATAL, true);
  });

  describe('LOG_LEVELS.FATAL and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.FATAL, false);
  });

  describe('LOG_LEVELS.OFF and enabled true', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.OFF, true);
  });

  describe('LOG_LEVELS.OFF and enabled false', () => {
    shouldCheckLoggerByLevelAndEnable(LOG_LEVELS.OFF, false);
  });

});
