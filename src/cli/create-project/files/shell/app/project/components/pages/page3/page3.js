/**
 * Copyright (C) 2021 to the present, Crestron Electronics, Inc.
 * All rights reserved.
 * No part of this software may be reproduced in any form, machine
 * or natural, without the express written consent of Crestron Electronics.
 * Use of this source code is subject to the terms of the Crestron Software License Agreement 
 * under which you licensed this source code.  
 *
 * This code was automatically generated by Crestron's code generation tool.
*/
/*jslint es6 */
/*global serviceModule, CrComLib */

let page3Module = (function () {
    'use strict';

    let outputValue = true;

    /**
     * Initialize Method
     */
    const onInit = () => {
        // BEGIN::CHANGEAREA - your initialization for page module code goes here         

        // console.log("page3Module.onInit()");
        serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/pages/page3/page3-emulator.json");
        // Uncomment the below line and comment the above to load the emulator all the time.
        // serviceModule.addEmulatorScenario("./app/project/components/pages/page3/page3-emulator.json");       

        // END::CHANGEAREA   
    }

    /**
     * Declare your Public Methods here
     */
    function getOutput() {
        return outputValue;
    }

    /**
     * private method for page class initialization
     */
    let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:page3-import-page', (value) => {
        if (value['loaded']) {
            onInit();
            setTimeout(() => {
                CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:page3-import-page', loadedSubId);
                loadedSubId = '';
            });
        }
    });    

    /**
     * All public method and properties are exported here
     */
    return {
        // BEGIN::CHANGEAREA - your code changing public interface to page module here 
        // END::CHANGEAREA           
        getOutput: getOutput
    };

}());