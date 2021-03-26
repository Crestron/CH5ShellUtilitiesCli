import { expect } from 'chai';
import { stdin } from 'mock-stdin';
import * as fse from 'fs-extra';
import { Ch5ExportAllCli } from '../../src/cli/export-all/Ch5ExportAllCli';

const exportAllComponent = new Ch5ExportAllCli();
const configPath = './app/project-config.json';
const configResetPath = './app/project-config-backup.json';

let io: any = null;
// Key codes
const keys = {
    space: '\x20',
    hiphen: '\x2D',
    charA: '\x61',
    charL: '\x6C'
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

function ask(question: string) {
    console.log(question);
    return new Promise(function (resolve) {
        process.stdin.once('data', function (data) {
            resolve(data.toString().trim());
        });
    });
}

describe('Export All of the project directory component >>>>>>>> ', () => {
    // tests here
    beforeEach(async () => {
        const del = await deleteProjectConfigFile();
        const cpy = await resetProjectConfig();
        console.log('done : ', del, ' | ', cpy);
        io = stdin();
    });

    afterEach(() => {
        io.restore();
    });

    it(`Export all of project`, async () => {
        //     // const sendKeystrokesForParam = async () => {
        //     //     await io.send(keys.space)
        //     //     io.send(keys.hiphen)
        //     //     io.send(keys.hiphen)
        //     //     io.send(keys.charA)
        //     //     io.send(keys.charL)
        //     //     io.send(keys.charL)
        //     // }
        //     // sendKeystrokesForParam().then();
           exportAllComponent.setInputArgsForTesting(["--all"]); // this is a dummy method to force set value of args before proceeding with the testing
            const response = await exportAllComponent.run();
            expect(response).to.equal(true);

        // process.nextTick(function mockResponse() {
        //     io.send('response1');
        //   });
        // return ask('test')
        //     .then(function (response) {
        //         console.assert(response === 'response');
        //     });
    });
});
