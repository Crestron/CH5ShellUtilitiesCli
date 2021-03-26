//  Condition: helper function test suite
require('./helpers/ch5clinaming_helpers.spec'); // 88 test cases
require('./helpers/ch5clicomponents_helpers.spec'); // 3 test cases
require('./helpers/ch5cliproject_config.spec'); // 11 test cases

//  Condition: cli function test suite
require('./cli/delete-components.spec'); // 2 test cases
require('./cli/export-all.spec'); // 1 test cases

//  Condition: cli function test suite of files residing as a sibling to each module
// require('./../src/cli/generate-page/Ch5GeneratePageCli.spec'); // 1 test cases