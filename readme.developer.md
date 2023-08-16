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
    },
    {
      "key": "projectName",
      "description": "Set the name of the Project in package.json and project-config.json",
      "type": "string",
      "default": "",
      "valueIfNotFound": "",
      "alias": [
        "--projectName"
      ],
      "allowedValues": [],
      "allowedAliases": [],
      "validation": "validatePackageJsonProjectName",
      "question": "CHECK_PROMPT_QUESTIONS.QUESTIONS.PROJECT_NAME",
      "isSpecialArgument": false
    },
    {
      "key": "projectType",
      "description": "This will add ZRC SDK “ch5-zoom-lib.js” to the template project packages and all required modules to the shell template project",
      "type": "enum",
      "default": "",
      "valueIfNotFound": "",
      "alias": [
        "--projectType"
      ],
      "allowedValues": [
        "ZoomRoomControl",
        "default"
      ],
      "allowedAliases": [
        "ZoomRoomControl",
        "default"
      ],
      "validation": "validateProjectType",
      "question": "",
      "isSpecialArgument": false
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

### setup local
`npm run setup:local`
