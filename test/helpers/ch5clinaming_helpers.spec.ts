/* eslint-disable no-undef */

import { expect } from 'chai';
import { Ch5CliNamingHelper } from '../../src/cli/Ch5CliNamingHelper';

const helper = new Ch5CliNamingHelper();

/**
 * Test suite for Ch5CliNamingHelper:decamelize
 */
describe('Ch5CliNamingHelper:decamelize >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.decamelize(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'hello world';
    const result = helper.decamelize(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:removeAllSpaces
 */
describe('Ch5CliNamingHelper:removeAllSpaces >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.removeAllSpaces(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'helloworld';
    const result = helper.removeAllSpaces(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:dasherize
 */
describe('Ch5CliNamingHelper:dasherize >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.dasherize(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'hello-world';
    const result = helper.dasherize(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:dashNunderscorize
 */
describe('Ch5CliNamingHelper:dashNunderscorize >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.dashNunderscorize(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'hello-world';
    const result = helper.dashNunderscorize(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:camelize
 */
describe('Ch5CliNamingHelper:camelize >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.camelize(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'helloWorld';
    const result = helper.camelize(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:classify
 */
describe('Ch5CliNamingHelper:classify >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.classify(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'HelloWorld';
    const result = helper.classify(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:underscore
 */
describe('Ch5CliNamingHelper:underscore >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.underscore(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'hello_world';
    const result = helper.underscore(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace
 */
describe('Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.convertMultipleSpacesToSingleSpace(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'hello world';
    const result = helper.convertMultipleSpacesToSingleSpace(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:capitalize
 */
describe('Ch5CliNamingHelper:capitalize >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.capitalize(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'Hello world';
    const result = helper.capitalize(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWord
 */
describe('Ch5CliNamingHelper:capitalizeEachWord >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.capitalizeEachWord(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'Hello World';
    const result = helper.capitalizeEachWord(param);
    expect(result).to.equal(expectedResult);
  });
});

/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWordWithSpaces
 */
describe('Ch5CliNamingHelper:capitalizeEachWordWithSpaces >>>>>>> ', () => {
  it('should test for `Empty String`', () => {
    const param = '';
    const expectedResult = '';
    const result = helper.capitalizeEachWordWithSpaces(param);
    expect(result).to.equal(expectedResult);
  });
  it('should test for `hello world`', () => {
    const param = 'hello world';
    const expectedResult = 'Hello World';
    const result = helper.capitalizeEachWordWithSpaces(param);
    expect(result).to.equal(expectedResult);
  });
});
