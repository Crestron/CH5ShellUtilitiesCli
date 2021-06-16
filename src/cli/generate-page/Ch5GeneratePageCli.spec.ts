import { expect } from 'chai';
import { stdin } from 'mock-stdin';
import { Ch5GeneratePageCli } from './Ch5GeneratePageCli';

const exportAllComponent = new Ch5GeneratePageCli();

let io: any = null;
// Key codes
const keys = {
    space: '\x20',
    hiphen: '\x2D',
    charA: '\x61',
    charL: '\x6C'
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
        //    exportAllComponent.setInputArgsForTesting(["--name", "page88"]); // this is a dummy method to force set value of args before proceeding with the testing
            // const response = await exportAllComponent.run();
            // expect(response).to.equal(true);

        // process.nextTick(function mockResponse() {
        //     io.send('response1');
        //   });
        // return ask('test')
        //     .then(function (response) {
        //         console.assert(response === 'response');
        //     });
    });
});
