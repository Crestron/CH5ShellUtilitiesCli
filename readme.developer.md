# CH5 Shell Utilities CLI

> Archiving and distribution utilities from the ch5-utilities library wrapped as CLI commands.

## Table of Contents

- [Background](#background)
- [Setup](#setup)
- [Commands](#commands)
- [Usage](#usage)
- [License](#license)

## Background

The purpose of the library is to expose the [ch5-shell-utilities](https://github.com/Crestron/CH5ShellUtilitiesCli) archive and distribute functionality.

## Setup

Build the library.
```
npm run build
```

Publish the ch5-shell-utilities-cli library for local usage.
```
npm link
```

## Commands

### npm run publish:local

After the initial setup, you can use this command to rebuild and publish changes in the library.

## Developer

### config.json

{
  "command": "String: This is the command that is used in the terminal. Ex: create:project etc",
  "name": "String: This is the name of the command. Same as the command in most cases.",
  "aliases": "String Array: Represents the possible alias names for the commands like gen:p for generate:page",
  "usage": "[options]",
  "description": "String: Provide a description for the command",
  "options": [
    {
      "key": "config",
      "description": "Config file required to create project",
      "type": "string",
      "default": "",
      "valueIfNotFound": "",
      "alias": [
        "--config"
      ],
      "allowedValues": [],
      "allowedAliases": [],
      "validation": "fileAvailableAtLocation",
      "question": "CHECK_PROMPT_QUESTIONS.QUESTIONS.CONFIG_FILE",
      "isSpecialArgument": "Boolean: Indicates special arguments that are not passed parameters like help or verbose or config "
    }
  ],
  "backupFolder": "./dist/",
  "additionalHelp": true,
  "automatedTests": {
    "enable": true,
    "enableComponentDeleteAfterTest": true
  },
  "allowedEnvironments": [
    "dev",
    "prod"
  ]
}

### Testing Scripts

Please replace ${USERNAME} with your username on /Users/${USERNAME}/Downloads. This path should work for Windows and Mac.

1. Create Project

1.1. Page-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

1.2. Widget-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

2. Update Project

2.1. Page-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:p -- --name 'page-2' -m Y && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

2.2. Widget-2

`rm -rf * && ch5-shell-cli create:project --projectName 'shell-template' && cd shell-template && npm install && npm run gen:w -- --name 'widget-2' && cd .. && mkdir tt1 && cd tt1 && ch5-shell-cli create:project --projectName 'shell-template' && cd 'shell-template' && ch5-shell-cli update:project --config /Users/${USERNAME}/Downloads/tt/shell-template/app/project-config.json && cd ..`

### Run a single spec file for testing
RUN A SINGLE SPEC
Often we're in the test code making changes, and it's easy to make adjustments to what subset of tests you run from here as well. If I want to run a single describe() function, I can add a .only() to the function call, like this:

describe(function () {
  // these tests will be skipped
});
describe.only(function () {
  // these tests will run
});
You can stick the .only() on any describe, no matter if it's first or last in the list of specs.

RUN A SINGLE TEST
Just as you can with describe, the tests can be specified to exclusively run if you attach .only() to the function call.

it.only(function () {
  // this test will run
});
it(function () {
  // this test will be skipped
});
Update 12 Oct 2015: The following note now does not apply. before, etc hooks are now verified to be run when running a single test.

Note! that by putting the .only() on a test, all other functions in the spec are skipped. This means that your before, beforeEach, after, and afterEach functions are not called. Sometimes it's hard to remember when that matters, so I usually end up running single specs instead of single tests.

SKIP SOMETHING
If you want to run all the specs/tests that you have minus some subset, effectively commenting out these tests, you can add .skip() to either describe or it function calls.

REMEMBER TO REMOVE
With the additions of the .only() or .skip() you are altering the actual code of your tests. This is great for your local development process. You'll need to be careful that you don't commit this change -- at least you usually won't want to. Otherwise, you CI process will be running a subset of your tests, just as you are locally, which is no bueno.

### setup local
`npm run setup:local`
