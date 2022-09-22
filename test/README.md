# Unit Testing CLI Components

The Unit testing part of CLI files are taken care by combining mocha(unit testing framework), chai(test cases), mochaawesome(reporter), mock-stdin (to mock cli inputs) among other modules.

## How to run
To execute the test cases, execute mocha on index.ts under test folder. This file consists/aggregates all the files which are part of the test suite.
Use `yarn mtest` to execute the test cases.

## DEV NOTE:
The `app/project-config.json` controls most of the CLI activities and must be refurbished before each test, since the spec relies on it to execute the commands.

### Dev References:
https://www.codota.com/code/javascript/functions/mock-stdin/stdin
https://glebbahmutov.com/blog/unit-testing-cli-programs/
https://shift.infinite.red/integration-testing-interactive-clis-93af3cc0d56f