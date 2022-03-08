export interface ICh5CliConfigFileParamOptions {
  key: string;
  description: string;
  type: string;
  default: string | boolean | null | undefined | number;
  valueIfNotFound: string | boolean | null | undefined | number;
  alias: string[];
  allowedValues?: string;
  allowedAliases?: string;
  validation?: string;
  question?: string;
  optionalArgument: boolean;
}

export interface ICh5CliConfigFile {
  [key: string]: string | string[] | ICh5CliConfigFileParamOptions[] | boolean;
  command: string;
  name: string;
  aliases: string[];
  usage: string;
  options: ICh5CliConfigFileParamOptions[];
  backupFolder: string;
  additionalHelp: boolean;
  automatedTests: boolean;
}
