export interface ICh5Cli {
  run(): Promise<void | boolean>;
}
export interface ICh5CliNew {
  initialize(): Promise<void>;
  verifyInputParams(): void;
  checkPromptQuestions(): void;
  processRequest(): void;
  cleanUp(): void;
}
