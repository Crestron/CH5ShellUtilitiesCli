"use strict";
/* eslint-disable no-undef */
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Ch5CliNamingHelper_1 = require("../../src/cli/Ch5CliNamingHelper");
var helper = new Ch5CliNamingHelper_1.Ch5CliNamingHelper();
/**
 * Test suite for Ch5CliNamingHelper:decamelize
 */
describe('Ch5CliNamingHelper:decamelize >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.decamelize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'hello world';
        var result = helper.decamelize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:removeAllSpaces
 */
describe('Ch5CliNamingHelper:removeAllSpaces >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.removeAllSpaces(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'helloworld';
        var result = helper.removeAllSpaces(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:dasherize
 */
describe('Ch5CliNamingHelper:dasherize >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.dasherize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'hello-world';
        var result = helper.dasherize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:dashNunderscorize
 */
describe('Ch5CliNamingHelper:dashNunderscorize >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.dashNunderscorize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'hello-world';
        var result = helper.dashNunderscorize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:camelize
 */
describe('Ch5CliNamingHelper:camelize >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.camelize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'helloWorld';
        var result = helper.camelize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:classify
 */
describe('Ch5CliNamingHelper:classify >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.classify(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'HelloWorld';
        var result = helper.classify(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:underscore
 */
describe('Ch5CliNamingHelper:underscore >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.underscore(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'hello_world';
        var result = helper.underscore(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace
 */
describe('Ch5CliNamingHelper:convertMultipleSpacesToSingleSpace >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.convertMultipleSpacesToSingleSpace(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'hello world';
        var result = helper.convertMultipleSpacesToSingleSpace(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:capitalize
 */
describe('Ch5CliNamingHelper:capitalize >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.capitalize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'Hello world';
        var result = helper.capitalize(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWord
 */
describe('Ch5CliNamingHelper:capitalizeEachWord >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.capitalizeEachWord(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'Hello World';
        var result = helper.capitalizeEachWord(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
/**
 * Test suite for Ch5CliNamingHelper:capitalizeEachWordWithSpaces
 */
describe('Ch5CliNamingHelper:capitalizeEachWordWithSpaces >>>>>>> ', function () {
    it('should test for `Empty String`', function () {
        var param = '';
        var expectedResult = '';
        var result = helper.capitalizeEachWordWithSpaces(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
    it('should test for `hello world`', function () {
        var param = 'hello world';
        var expectedResult = 'Hello World';
        var result = helper.capitalizeEachWordWithSpaces(param);
        chai_1.expect(result).to.equal(expectedResult);
    });
});
