import {expect} from 'chai';
import {Ch5CliNamingHelper} from "./Ch5CliNamingHelper";

const fs = require('fs');
const fsExtra = require('fs-extra');

const ch5namingHelper = new Ch5CliNamingHelper();

describe('Ch5 CLI Naming helper >>>>>>>> ', () => {
  it(`decamelize`, () => {
    expect(ch5namingHelper.decamelize('innerHTML')).equals('inner_html');
    expect(ch5namingHelper.decamelize('action_name')).equals('action_name');
    expect(ch5namingHelper.decamelize('css-class-name')).equals('css-class-name');
    expect(ch5namingHelper.decamelize('my favorite items')).equals('my favorite items');
  });

  it('remove all spaces', () => {
    expect(ch5namingHelper.removeAllSpaces('innerHTML')).equals('innerHTML');
    expect(ch5namingHelper.removeAllSpaces('action_name')).equals('action_name');
    expect(ch5namingHelper.removeAllSpaces('css-class-name')).equals('css-class-name');
    expect(ch5namingHelper.removeAllSpaces('my       favorite items')).equals('myfavoriteitems');
  });

  it('dasherize', () => {
    expect(ch5namingHelper.dasherize('innerHTML')).equals('inner-html');
    expect(ch5namingHelper.dasherize('action_name')).equals('action-name');
    expect(ch5namingHelper.dasherize('css-class-name')).equals('css-class-name');
    expect(ch5namingHelper.dasherize('my favorite items')).equals('my-favorite-items');
  });

  it('dashNunderscorize', () => {
    expect(ch5namingHelper.dashNunderscorize('innerHTML')).equals('inner_html');
    expect(ch5namingHelper.dashNunderscorize('action_name')).equals('action_name');
    expect(ch5namingHelper.dashNunderscorize('css-class-name')).equals('css-class-name');
    expect(ch5namingHelper.dashNunderscorize('my favorite items')).equals('my-favorite-items');
  });

  it('camelize', () => {
    expect(ch5namingHelper.camelize('innerHTML')).equals('innerHTML');
    expect(ch5namingHelper.camelize('action_name')).equals('actionName');
    expect(ch5namingHelper.camelize('css-class-name')).equals('cssClassName');
    expect(ch5namingHelper.camelize('my favorite items')).equals('myFavoriteItems');
    expect(ch5namingHelper.camelize('My favorite items')).equals('myFavoriteItems');
  });

  it('classify', () => {
    expect(ch5namingHelper.classify('innerHTML')).equals('InnerHTML');
    expect(ch5namingHelper.classify('action_name')).equals('ActionName');
    expect(ch5namingHelper.classify('css-class-name')).equals('CssClassName');
    expect(ch5namingHelper.classify('my favorite items')).equals('MyFavoriteItems');
    expect(ch5namingHelper.classify('My favorite items')).equals('MyFavoriteItems');
  });

  it('underscore', () => {
    expect(ch5namingHelper.underscore('innerHTML')).equals('inner_html');
    expect(ch5namingHelper.underscore('action_name')).equals('action_name');
    expect(ch5namingHelper.underscore('css-class-name')).equals('css_class_name');
    expect(ch5namingHelper.underscore('my favorite items')).equals('my_favorite_items');
    expect(ch5namingHelper.underscore('My favorite items')).equals('my_favorite_items');
  });

  it('convert multiple spaces to single', () => {
    expect(ch5namingHelper.convertMultipleSpacesToSingleSpace('my favorite items')).equals('my favorite items');
    expect(ch5namingHelper.convertMultipleSpacesToSingleSpace('my    favorite items')).equals('my favorite items');
    expect(ch5namingHelper.convertMultipleSpacesToSingleSpace('my      favorite items')).equals('my favorite items');
  });

  it('capitalize', () => {
    expect(ch5namingHelper.capitalize('innerHTML')).equals('InnerHTML');
    expect(ch5namingHelper.capitalize('action_name')).equals('Action_name');
    expect(ch5namingHelper.capitalize('css-class-name')).equals('Css-class-name');
    expect(ch5namingHelper.capitalize('my favorite items')).equals('My favorite items');
    expect(ch5namingHelper.capitalize('My favorite items')).equals('My favorite items');
  });

  it('capitalize each word', () => {
    expect(ch5namingHelper.capitalizeEachWord('innerHTML')).equals('InnerHTML');
    expect(ch5namingHelper.capitalizeEachWord('action_name')).equals('ActionName');
    expect(ch5namingHelper.capitalizeEachWord('css-class-name')).equals('CssClassName');
    expect(ch5namingHelper.capitalizeEachWord('my favorite items')).equals('My Favorite Items');
    expect(ch5namingHelper.capitalizeEachWord('My favorite items')).equals('My Favorite Items');
  });

  it('capitalize each word with spaces', () => {
    expect(ch5namingHelper.capitalizeEachWordWithSpaces('innerHTML')).equals('Inner Html');
    expect(ch5namingHelper.capitalizeEachWordWithSpaces('action_name')).equals('Action Name');
    expect(ch5namingHelper.capitalizeEachWordWithSpaces('css-class-name')).equals('Css Class Name');
    expect(ch5namingHelper.capitalizeEachWordWithSpaces('my favorite items')).equals('My Favorite Items');
    expect(ch5namingHelper.capitalizeEachWordWithSpaces('My favorite items')).equals('My Favorite Items');
  });
});
