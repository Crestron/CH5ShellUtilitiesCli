import { expect } from 'chai';
import { Ch5CliNamingHelper } from "./Ch5CliNamingHelper";

const ch5namingHelper = new Ch5CliNamingHelper();

const itMessage = (input: any, output: any) => {
  return `Input: '${input}' should return Output: '${output}'`;
}

describe('Ch5 CLI Naming helper >>>>>>>> ', () => {

  describe('decamelize', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "inner_html" },
      { input: "action_name", output: "action_name" },
      { input: "css-class-name", output: "css-class-name" },
      { input: "my favorite items", output: "my favorite items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.decamelize(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('remove all spaces: removeAllSpaces', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "innerHTML" },
      { input: "action_name", output: "action_name" },
      { input: "css-class-name", output: "css-class-name" },
      { input: "my       favorite items", output: "myfavoriteitems" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.removeAllSpaces(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('dasherize', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "inner-html" },
      { input: "action_name", output: "action-name" },
      { input: "css-class-name", output: "css-class-name" },
      { input: "my favorite items", output: "my-favorite-items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.dasherize(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('dashNunderscorize', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "inner_html" },
      { input: "action_name", output: "action_name" },
      { input: "css-class-name", output: "css-class-name" },
      { input: "my favorite items", output: "my-favorite-items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.dashNunderscorize(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('camelize', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "innerHTML" },
      { input: "action_name", output: "actionName" },
      { input: "css-class-name", output: "cssClassName" },
      { input: "my favorite items", output: "myFavoriteItems" },
      { input: "My favorite items", output: "myFavoriteItems" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.camelize(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('classify', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "InnerHTML" },
      { input: "action_name", output: "ActionName" },
      { input: "css-class-name", output: "CssClassName" },
      { input: "my favorite items", output: "MyFavoriteItems" },
      { input: "My favorite items", output: "MyFavoriteItems" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.classify(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('underscore', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "inner_html" },
      { input: "action_name", output: "action_name" },
      { input: "css-class-name", output: "css_class_name" },
      { input: "my favorite items", output: "my_favorite_items" },
      { input: "My favorite items", output: "my_favorite_items" }
    ];
    expect(ch5namingHelper.underscore('innerHTML')).equals('inner_html');
    expect(ch5namingHelper.underscore('action_name')).equals('action_name');
    expect(ch5namingHelper.underscore('css-class-name')).equals('css_class_name');
    expect(ch5namingHelper.underscore('my favorite items')).equals('my_favorite_items');
    expect(ch5namingHelper.underscore('My favorite items')).equals('my_favorite_items');

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.underscore(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('convert multiple spaces to single: convertMultipleSpacesToSingleSpace', () => {

    const successInputOutput = [
      { input: "my favorite items", output: "my favorite items" },
      { input: "my    favorite items", output: "my favorite items" },
      { input: "my      favorite       items", output: "my favorite items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.convertMultipleSpacesToSingleSpace(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('capitalize', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "InnerHTML" },
      { input: "action_name", output: "Action_name" },
      { input: "css-class-name", output: "Css-class-name" },
      { input: "my favorite items", output: "My favorite items" },
      { input: "My favorite items", output: "My favorite items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.capitalize(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('capitalize each word: capitalizeEachWord', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "InnerHTML" },
      { input: "action_name", output: "ActionName" },
      { input: "css-class-name", output: "CssClassName" },
      { input: "my favorite items", output: "My Favorite Items" },
      { input: "My favorite items", output: "My Favorite Items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.capitalizeEachWord(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

  describe('capitalize each word with spaces: capitalizeEachWordWithSpaces', () => {

    const successInputOutput = [
      { input: "innerHTML", output: "Inner Html" },
      { input: "action_name", output: "Action Name" },
      { input: "css-class-name", output: "Css Class Name" },
      { input: "my favorite items", output: "My Favorite Items" },
      { input: "My favorite items", output: "My Favorite Items" }
    ];

    for (let i: number = 0; i < successInputOutput.length; i++) {
      it(itMessage(successInputOutput[i].input, successInputOutput[i].output), () => {
        expect(ch5namingHelper.capitalizeEachWordWithSpaces(successInputOutput[i].input)).equals(successInputOutput[i].output);
      });
    }

  });

});
