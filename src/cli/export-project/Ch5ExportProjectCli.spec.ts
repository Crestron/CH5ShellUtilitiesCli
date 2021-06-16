import { expect } from 'chai';
import * as sinon from 'sinon';

import {Ch5ExportProjectCli} from "./Ch5ExportProjectCli";
import {Ch5CliUtil} from "../Ch5CliUtil";

const exportProjectComponent = new Ch5ExportProjectCli();

describe('Export a project >>>>>>>> ', () => {
    afterEach(() => {
        // Revert any stubs / mocks created using sinon
        sinon.restore();
    });

    it(`Expect export project to return true`, async () => {
        // Mock functions which gets called inside exportProjectComponent.run so they are not actually called
        const deleteFilespy = sinon.stub(Ch5CliUtil.prototype, 'deleteFile');
        const copyFilesSpy = sinon.spy(exportProjectComponent, 'copyFiles');
        const createTempFolder = sinon.spy(exportProjectComponent, 'createTempFolder');

        const response = await exportProjectComponent.run();
        expect(deleteFilespy.called).equals(true);
        expect(deleteFilespy.calledWith('./dist/@crestron/ch5-shell-utilities-cli.zip')).equals(true);
        expect(createTempFolder.called).equals(true);
        expect(createTempFolder.calledWith('@crestron/ch5-shell-utilities-cli-Code-Folder-Temp')).equals(true);

        expect(copyFilesSpy.called).equals(true);

        expect(response).equals(true);
    });
});
