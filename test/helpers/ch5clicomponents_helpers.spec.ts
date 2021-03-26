/* eslint-disable no-undef */

import { expect } from 'chai';
import { Ch5CliComponentsHelper } from '../../src/cli/Ch5CliComponentsHelper';

const helper = new Ch5CliComponentsHelper();
const path = './app/project-config.json';

Execute_Suite_Ch5CliComponentsHelper();

/**
 * Function to aggregate all test cases into a single final method
 */
function Execute_Suite_Ch5CliComponentsHelper() {
    test_readFileContent();
    test_readFileContentSync();
    test_readFile();
    test_processArgs();
    test_processArgsAnalyze();
}

/**
 * Test suite for Ch5CliComponentsHelper:readFileContent
 */
function test_readFileContent() {
    describe(`Ch5CliComponentsHelper:readFileContent >>>>>>> Total Test cases - 1`, () => {
        it(`should test readFileContent`, () => {
            const res = helper.readFileContent(path);
            console.log(typeof res);
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliComponentsHelper:readFileContentSync
 */
function test_readFileContentSync() {
    describe(`Ch5CliComponentsHelper:readFileContentSync >>>>>>> Total Test cases - 1`, () => {
        it(`should test readFileContentSync`, async () => {
            const res = await helper.readFileContentSync(path);
            console.log(typeof res);
            expect(typeof res).to.equal('string');
        });
    });
}

/**
 * Test suite for Ch5CliComponentsHelper:readFile
 */
function test_readFile() {
    describe(`Ch5CliComponentsHelper:readFile >>>>>>> Total Test cases `, () => {
        it(`should test readFile`, () => {
            const res = helper.readFile(path);
            console.log(typeof res);
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliComponentsHelper:processArgs
 */
function test_processArgs() {
    describe(`Ch5CliComponentsHelper:processArgs >>>>>>> Total Test cases 0`, () => {
    });
}

/**
 * Test suite for Ch5CliComponentsHelper:processArgsAnalyze
 */
function test_processArgsAnalyze() {
    describe(`Ch5CliComponentsHelper:processArgsAnalyze >>>>>>> Total Test cases 0`, () => {
    });
}