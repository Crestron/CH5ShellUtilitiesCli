import { expect } from 'chai';
import { stdin } from 'mock-stdin';
import { Ch5ExportAllCli } from '../../src/cli/export-all/Ch5ExportAllCli';

const exportAllComponent = new Ch5ExportAllCli();

let io: any = null;
// Key codes
const keys = {
    space: '\x20',
    hiphen: '\x2D',
    charA: '\x61',
    charL: '\x6C'
}

describe('Export All of the project directory component >>>>>>>> ', () => {
    // tests here
    beforeEach(async () => {
        io = stdin();
    })

    afterEach(() => {
        io.restore();
    })
    it(`Export all of project`, async () => {
        // const sendKeystrokesForParam = async () => {
        //     await io.send(keys.space)
        //     io.send(keys.hiphen)
        //     io.send(keys.hiphen)
        //     io.send(keys.charA)
        //     io.send(keys.charL)
        //     io.send(keys.charL)
        // }
        // sendKeystrokesForParam().then();
        exportAllComponent.updateInputArgs("all", true); // this is a dummy method to force set value of args before proceeding with the testing
        const response = await exportAllComponent.run();
        expect(response).to.equal(true);
    });
});
