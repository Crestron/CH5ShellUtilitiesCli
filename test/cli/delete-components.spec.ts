import { expect } from 'chai';
import { stdin } from 'mock-stdin';
// import {fs} from 'file-system';
import * as fs from 'fs';
import { Ch5DeleteComponentsCli } from '../../src/cli/delete-components/Ch5DeleteComponentsCli';

const deleteComponent = new Ch5DeleteComponentsCli();

let io: any = null;
before(() => (io = stdin()));
after(() => io.restore());

// Key codes
const keys = {
    up: '\x1B\x5B\x41',
    down: '\x1B\x5B\x42',
    enter: '\x0D',
    space: '\x20'
}

const configPath = './app/project-config.json';
const configResetPath = './app/project-config-backup.json';

const deleteProjectConfigFile = () => {
    try {
        fs.unlinkSync(configPath);
        //file removed
    } catch (err) {
        console.error(err)
    }
}

const resetProjectConfig = async () => {
    console.log('Copying project config file before testing starts');
    await fs.copyFileSync(configResetPath, configPath);
}

describe('Delete a project component >>>>>>>> ', () => {
    // tests here
    beforeEach(async () => {
        const del = await deleteProjectConfigFile();
        const cpy = await resetProjectConfig();
        console.log('done : ', del, ' | ', cpy);
        io = stdin();
    })

    afterEach(() => {
        io.restore();
    })

    it(`If component exists`, async () => {
        const sendKeystrokes = async () => {
            await io.send(keys.down)
            io.send(keys.down)
            io.send(keys.space)
            io.send(keys.enter)
        }
        const sendKeystrokesForConfirm = async () => {
            await io.send(keys.space)
            io.send(keys.enter)
        }
        setTimeout(() => sendKeystrokes().then(), 5);
        setTimeout(() => sendKeystrokesForConfirm().then(), 500);
        const response = await deleteComponent.run();
        expect(response).to.equal(true);
    });

    it(`If component doesn't exist`, async () => {
        const sendKeystrokes = async () => {
            await io.send(keys.down)
            io.send(keys.down)
            io.send(keys.space)
            io.send(keys.enter)
        }
        const sendKeystrokesForConfirm = async () => {
            await io.send(keys.space)
            io.send(keys.enter)
        }
        let response;
        for (let i = 0; i < 10; i++) {
            setTimeout(() => sendKeystrokes().then(), 5);
            setTimeout(() => sendKeystrokesForConfirm().then(), 500);
            response = await deleteComponent.run();
            if (!response) { // response becomes false when no files exist to delete
                break;
            }
        }
        expect(response).to.equal(false);
    });
})