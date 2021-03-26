/* eslint-disable no-undef */

import { expect } from 'chai';
import * as fse from 'fs-extra';
import { Ch5CliProjectConfig } from '../../src/cli/Ch5CliProjectConfig';

const moduleConfig = new Ch5CliProjectConfig();
const configPath = './app/project-config.json';
const configResetPath = './app/project-config-backup.json';

Execute_Suite_Ch5CliProjectConfig();

async function Execute_Suite_Ch5CliProjectConfig() {
    test_getJson();
    test_getAllPages();
    test_getAllWidgets();
    test_getAllPagesAndWidgets();
    test_getAllNavigations();
    test_getHighestNavigationSequence();
}

/**
 * Function to delete the project config before resetting it
 */
async function deleteProjectConfigFile() {
    try {
        fse.unlinkSync(configPath);
        //file removed
    } catch (err) {
        console.error(err)
    }
}

/**
 * Function to reset the project config before beginning the test suite
 */
async function resetProjectConfig() {
    console.log('Copying project config file before testing starts');
    await fse.copyFileSync(configResetPath, configPath);
    console.log('Copying project config file before testing starts');
    await fse.copyFileSync(configResetPath, configPath);
    const dir = './app/project';
    await fse.remove(dir);
    await fse.copy(dir + '-backup', dir);
}

/**
 * Test suite for Ch5CliProjectConfig:getJson
 */
function test_getJson() {
    describe(`Ch5CliProjectConfig:getJson >>>>>>> Total Test cases - 1`, () => {
        beforeEach(async () => {
            const del = await deleteProjectConfigFile();
            const cpy = await resetProjectConfig();
            console.log('done : ', del, ' | ', cpy);
        })
        it(`should test getJson`, () => {
            const res = moduleConfig.getJson();
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliProjectConfig:getAllPages
 */
function test_getAllPages() {
    describe(`Ch5CliProjectConfig:getAllPages >>>>>>> Total Test cases - 2`, () => {
        const res = moduleConfig.getAllPages();
        it(`should test getAllPages length`, () => {
            expect(res.length).to.equal(7);
        });
        it(`should test getAllPages type`, () => {
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliProjectConfig:getAllWidgets
 */
function test_getAllWidgets() {
    describe(`Ch5CliProjectConfig:getAllWidgets >>>>>>> Total Test cases - 2`, () => {
        const res = moduleConfig.getAllWidgets();
        it(`should test getAllWidgets length`, () => {
            expect(res.length).to.equal(1);
        });
        it(`should test getAllWidgets type`, () => {
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliProjectConfig:getAllPagesAndWidgets
 */
function test_getAllPagesAndWidgets() {
    describe(`Ch5CliProjectConfig:getAllPagesAndWidgets >>>>>>> Total Test cases - 2`, () => {
        const res: any = moduleConfig.getAllPagesAndWidgets();
        it(`should test getAllPagesAndWidgets length - pages 7 + widgets 1 = 8`, () => {
            expect(res.length).to.equal(8);
        });
        it(`should test getAllPagesAndWidgets type`, () => {
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliProjectConfig:getAllNavigations
 */
function test_getAllNavigations() {
    describe(`Ch5CliProjectConfig:getAllNavigations >>>>>>> Total Test cases - 2`, () => {
        const res = moduleConfig.getAllNavigations();
        it(`should test getAllNavigations length`, () => {
            expect(res.length).to.equal(7);
        });
        it(`should test getAllNavigations type`, () => {
            expect(typeof res).to.equal('object');
        });
    });
}

/**
 * Test suite for Ch5CliProjectConfig:getHighestNavigationSequence
 */
function test_getHighestNavigationSequence() {
    describe(`Ch5CliProjectConfig:getHighestNavigationSequence >>>>>>> Total Test cases - 2`, () => {
        const res = moduleConfig.getHighestNavigationSequence();
        it(`should test getHighestNavigationSequence value`, () => {
            expect(res).to.equal(7);
        });
        it(`should test getHighestNavigationSequence type`, () => {
            expect(typeof res).to.equal('number');
        });
    });
}