const fsExtra = require("fs-extra");
const process = require("process");

const inputArg = process.argv[2] ? process.argv[2] : "prod";
try {
  fsExtra.copySync('./build/cli/files/environment.' + inputArg + '.json', './build/cli/files/environment.json');
  fsExtra.removeSync('./build/cli/files/environment.dev.json');
  fsExtra.removeSync('./build/cli/files/environment.prod.json');
} catch (e) {
  console.error("Unable to create environment file !!!!!");
}
