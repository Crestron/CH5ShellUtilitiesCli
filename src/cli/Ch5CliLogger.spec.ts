import {Ch5CliLogger, LOG_LEVELS} from "./Ch5CliLogger";
import {expect} from 'chai';
import * as sinon from "sinon";
import {SinonStub} from "sinon";

const fs = require('fs');
const fsExtra = require('fs-extra');

const ch5CliLogger = new Ch5CliLogger(true, LOG_LEVELS.TRACE);
const ch5CliLoggerDisabled = new Ch5CliLogger(false, LOG_LEVELS.TRACE);

describe('Ch5 CLI Logger enabled >>>>>>>> ', () => {
  let consoleLogStub: SinonStub;
  let consoleWarnStub: SinonStub;
  let consoleErrorStub: SinonStub;
  let consoleInfoStub: SinonStub;
  let consoleTraceStub: SinonStub;

  before(() => {
    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
    consoleInfoStub = sinon.stub(console, 'info');
    consoleTraceStub = sinon.stub(console, 'trace');
  });

  after(() => {
    sinon.restore();
  });

  it(`linebreak`, () => {
    ch5CliLogger.linebreak(2);
    expect(consoleLogStub.calledWith('\n\n')).equals(true);
  });

  it('log', () => {
    ch5CliLogger.log('test ');
    expect(consoleLogStub.called).equals(true);
  });

  it('warn', () => {
    ch5CliLogger.warn(' test ');
    expect(consoleWarnStub.called).equals(true);
  });

  it('error', () => {
    ch5CliLogger.error(' test ');
    expect(consoleErrorStub.called).equals(true);
  });

  it('info', () => {
    ch5CliLogger.info(' test ');
    expect(consoleInfoStub.called).equals(true);
  });

  it('trace', () => {
    ch5CliLogger.trace(' test ');
    expect(consoleTraceStub.called).equals(true);
  });

  it('print success', () => {
    ch5CliLogger.printSuccess('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print warning', () => {
    ch5CliLogger.printWarning('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print error', () => {
    ch5CliLogger.printError('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print log', () => {
    ch5CliLogger.printLog('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('on error', () => {
    try {
      ch5CliLogger.onErr(new Error(''));
    } catch (err) {}
    expect(consoleErrorStub.called).equals(true);
  })
});

describe('Ch5 CLI Logger disabled >>>>>>>> ', () => {
  let consoleLogStub: SinonStub;
  let consoleWarnStub: SinonStub;
  let consoleErrorStub: SinonStub;
  let consoleInfoStub: SinonStub;
  let consoleTraceStub: SinonStub;

  before(() => {
    consoleLogStub = sinon.stub(console, 'log');
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleErrorStub = sinon.stub(console, 'error');
    consoleInfoStub = sinon.stub(console, 'info');
    consoleTraceStub = sinon.stub(console, 'trace');
  });

  after(() => {
    sinon.restore();
  });

  it(`linebreak`, () => {
    ch5CliLoggerDisabled.linebreak(2);
    expect(consoleLogStub.calledWith('\n\n')).equals(true);
  });

  it('log', () => {
    ch5CliLoggerDisabled.log('test ');
    expect(consoleLogStub.called).equals(true);
  });

  it('warn', () => {
    ch5CliLoggerDisabled.warn(' test ');
    expect(consoleWarnStub.called).equals(false);
  });

  it('error', () => {
    ch5CliLoggerDisabled.error(' test ');
    expect(consoleErrorStub.called).equals(false);
  });

  it('info', () => {
    ch5CliLoggerDisabled.info(' test ');
    expect(consoleInfoStub.called).equals(false);
  });

  it('trace', () => {
    ch5CliLoggerDisabled.trace(' test ');
    expect(consoleTraceStub.called).equals(false);
  });

  it('print success', () => {
    ch5CliLoggerDisabled.printSuccess('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print warning', () => {
    ch5CliLoggerDisabled.printWarning('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print error', () => {
    ch5CliLoggerDisabled.printError('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('print log', () => {
    ch5CliLoggerDisabled.printLog('');
    expect(consoleInfoStub.called).equals(true);
  });

  it('on error', () => {
    try {
      ch5CliLogger.onErr(new Error(''));
    } catch (err) {}
    expect(consoleErrorStub.called).equals(true);
  });
});
