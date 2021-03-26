/* eslint-disable no-undef */

import { expect } from 'chai';
import * as fse from 'fs-extra';
import { Ch5CliNamingHelper } from '../../src/cli/Ch5CliNamingHelper';

const helper = new Ch5CliNamingHelper();

const paramArray = ['EMPTY_STRING', 'hello world', 'innerHTML', 'action_name', 'ALLCAPS', 'css-class-name', 'my favorite items', '-~!@#$%^&*()+='];
const configPath = './app/project-config.json';
const configResetPath = './app/project-config-backup.json';

Execute_Suite_Ch5CliNamingHelper();

/**
 * Function to aggregate all test cases into a single final method
 */
function Execute_Suite_Ch5CliNamingHelper() {
  // Execute all test cases
  test_decamelize();
  test_removeAllSpaces();
  test_dasherize();
  test_dashNunderscorize();
  test_camelize();
  test_classify();
  test_underscore();
  test_convertMultipleSpacesToSingleSpace();
  test_capitalize();
  test_capitalizeEachWord();
  test_capitalizeEachWordWithSpaces();
}

/**
 * Function to delete the project config before resetting it
 */
async function deleteProjectConfigFile() {
    try {
        fse.unlinkSync(configPath);
        //file removed
    } catch (err) {
        console.error(err)
    }
}

/**
 * Function to reset the project config before beginning the test suite
 */
async function resetProjectConfig() {
    console.log('Copying project config file before testing starts');
    await fse.copyFileSync(configResetPath, configPath);
    console.log('Copying project config file before testing starts');
    await fse.copyFileSync(configResetPath, configPath);
    const dir = './app/project';
    await fse.remove(dir);
    await fse.copy(dir + '-backup', dir);
}

/**
 * Test suite for Ch5CliNamingHelper:decamelize
 */
function test_decamelize() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:decamelize >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'hello world', 'inner_html', 'action_name', 'allcaps', 'css-class-name', 'my favorite items', '-~!@#$%^&*()+='];
    beforeEach(async () => {
        const del = await deleteProjectConfigFile();
        const cpy = await resetProjectConfig();
        console.log('done : ', del, ' | ', cpy);
    })
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.decamelize(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:removeAllSpaces
 */
function test_removeAllSpaces() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:removeAllSpaces >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'helloworld', 'innerHTML', 'action_name', 'ALLCAPS', 'css-class-name', 'myfavoriteitems', '-~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.removeAllSpaces(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:dasherize
 */
function test_dasherize() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:dasherize >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'hello-world', 'inner-html', 'action-name', 'allcaps', 'css-class-name', 'my-favorite-items', '-~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.dasherize(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:dashNunderscorize
 */
function test_dashNunderscorize() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:dashNunderscorize >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'hello-world', 'inner_html', 'action_name', 'allcaps', 'css-class-name', 'my-favorite-items', '-~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.dashNunderscorize(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:camelize
 */
function test_camelize() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:camelize >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'helloWorld', 'innerHTML', 'actionName', 'aLLCAPS', 'cssClassName', 'myFavoriteItems', '~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.camelize(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:classify
 */
function test_classify() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:classify >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'HelloWorld', 'InnerHTML', 'ActionName', 'ALLCAPS', 'CssClassName', 'MyFavoriteItems', '~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.classify(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:underscore
 */
function test_underscore() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:underscore >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'hello_world', 'inner_html', 'action_name', 'allcaps', 'css_class_name', 'my_favorite_items', '_~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.underscore(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace
 */
function test_convertMultipleSpacesToSingleSpace() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'hello world', 'innerHTML', 'action_name', 'ALLCAPS', 'css-class-name', 'my favorite items', '-~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.convertMultipleSpacesToSingleSpace(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:capitalize
 */
function test_capitalize() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:capitalize >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'Hello world', 'InnerHTML', 'Action_name', 'ALLCAPS', 'Css-class-name', 'My favorite items', '-~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.capitalize(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWord
 */
function test_capitalizeEachWord() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:capitalizeEachWord >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'Hello World', 'InnerHTML', 'ActionName', 'ALLCAPS', 'CssClassName', 'My Favorite Items', '~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.capitalizeEachWord(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}

/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWordWithSpaces
 */
function test_capitalizeEachWordWithSpaces() {
  const params = [...paramArray];
  describe(`Ch5CliNamingHelper:capitalizeEachWordWithSpaces >>>>>>> Total Test cases : ${params.length}`, () => {
    const expectedOutputArr = ['', 'Hello World', 'Inner Html', 'Action Name', 'Allcaps', 'Css Class Name', 'My Favorite Items', ' ~!@#$%^&*()+='];
    for (let i = 0; i < params.length; i++) {
      const key = params[i];
      it(`should test for ${key}`, () => {
        const param = params[i].replace('EMPTY_STRING', '');
        const expectedResult = expectedOutputArr[i];
        const result = helper.capitalizeEachWordWithSpaces(param);
        expect(result).to.equal(expectedResult);
      });
    }
  });
}