// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

// import chalk from "chalk";
// import { DeviceType, OutputLevel } from "@crestron/ch5-utilities";

export class Ch5CliNamingHelper {
   /**
   * Converts a camelized string into all lower case separated by underscores.

   * decamelize('innerHTML');         // 'inner_html'
   * decamelize('action_name');       // 'action_name'
   * decamelize('css-class-name');    // 'css-class-name'
   * decamelize('my favorite items'); // 'my favorite items'
 
   * @method decamelize
   * @param {String} str The string to decamelize.
   * @return {String} the decamelized string.
	*/
  decamelize (str:string) {
    let STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
    return str.replace(STRING_DECAMELIZE_REGEXP, "$1_$2").toLowerCase();
  }

  /**
   *
   * @param {string} str Input string for removing spaces
   */
  removeAllSpaces (str:string) {
    return str.replace(/ /g, "");
  }

  /**
   * Replaces underscores, spaces, or camelCase with dashes.

   * dasherize('innerHTML');         // 'inner-html'
   * dasherize('action_name');       // 'action-name'
   * dasherize('css-class-name');    // 'css-class-name'
   * dasherize('my favorite items'); // 'my-favorite-items'
 
   * @method dasherize
   * @param {String} str The string to dasherize.
   * @return {String} the dasherized string.
 	*/
  dasherize (str:string) {
    let STRING_DASHERIZE_REGEXP = /[ _]/g;
    return this.decamelize(str).replace(STRING_DASHERIZE_REGEXP, "-");
  }

  /**
   * Replaces spaces, or camelCase with dashes.

   * @method dashNunderscorize
   * @param {String} str The string to dasherize.
   * @return {String} the dasherized string.
 	*/
  dashNunderscorize (str:string) {
    let STRING_DASHERIZE_REGEXP = /[ ]/g;
    return this.decamelize(str).replace(STRING_DASHERIZE_REGEXP, "-");
  }

  /**
   * Returns the lowerCamelCase form of a string.

   * camelize('innerHTML');          // 'innerHTML'
   * camelize('action_name');        // 'actionName'
   * camelize('css-class-name');     // 'cssClassName'
   * camelize('my favorite items');  // 'myFavoriteItems'
   * camelize('My Favorite Items');  // 'myFavoriteItems'
 
   * @method camelize
   * @param {String} str The string to camelize.
   * @return {String} the camelized string.
 	*/
  camelize (str:string) {
    let STRING_CAMELIZE_REGEXP = /(-|_|\.|\s)+(.)?/g;
    return str
      .replace(STRING_CAMELIZE_REGEXP, (match, separator, chr) => {
        return chr ? chr.toUpperCase() : "";
      })
      .replace(/^([A-Z])/, (match) => match.toLowerCase());
  }

  /**
   * Returns the UpperCamelCase form of a string.

   * 'innerHTML'.classify();          // 'InnerHTML'
   * 'action_name'.classify();        // 'ActionName'
   * 'css-class-name'.classify();     // 'CssClassName'
   * 'my favorite items'.classify();  // 'MyFavoriteItems'

   * @method classify
   * @param {String} str the string to classify
   * @return {String} the classified string
  */
  classify (str:string) {
    return str
      .split(".")
      .map((part) => this.capitalize(this.camelize(part)))
      .join(".");
  }

  /**
   * More general than decamelize. Returns the lower\_case\_and\_underscored form of a string.

	 * 'innerHTML'.underscore();          // 'inner_html'
   * 'action_name'.underscore();        // 'action_name'
   * 'css-class-name'.underscore();     // 'css_class_name'
   * 'my favorite items'.underscore();  // 'my_favorite_items'

   * @method underscore
   * @param {String} str - The string to underscore.
   * @return {String} the underscored string.
  */
  underscore (str:string) {
    let STRING_UNDERSCORE_REGEXP_1 = /([a-z\d])([A-Z]+)/g;
    let STRING_UNDERSCORE_REGEXP_2 = /-|\s+/g;

    return str.replace(STRING_UNDERSCORE_REGEXP_1, "$1_$2").replace(STRING_UNDERSCORE_REGEXP_2, "_").toLowerCase();
  }

  /**
   * Convert multiple spaces to single space.
  
   * @method underscore
   * @param {String} str - The string to convert multiple spaces to single space.
  */
  convertMultipleSpacesToSingleSpace(str:string) {
    let STRING_MULTISPACE_REGEXP = /\s\s+/g;
    return str.trim().replace(STRING_MULTISPACE_REGEXP, " ");
  }

  /**
   * Returns the Capitalized form of a string

   * 'innerHTML'.capitalize()         // 'InnerHTML'
   * 'action_name'.capitalize()       // 'Action_name'
   * 'css-class-name'.capitalize()    // 'Css-class-name'
   * 'my favorite items'.capitalize() // 'My favorite items'

   * @method capitalize
   * @param {String} str - The string to capitalize.
   * @return {String} The capitalized string.
  */
  capitalize (str:string) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }

  /**
   * Returns the Capitalized form for each word of a string

   * @method capitalize each word
   * @param {String} str The string to capitalize.
   * @return {String} The capitalized string.
  */
  capitalizeEachWord(str:string, chrChange:string = ' ') {
    return str
      .split(chrChange)
      .map((part) => this.capitalize(this.camelize(part)))
      .join(chrChange);
  }

  /**
   * Returns the Capitalized form for each word of a string

   * @method capitalize each word
   * @param {String} str The string to capitalize.
   * @return {String} The capitalized string.
  */
  capitalizeEachWordWithSpaces(str:string) {
    return this.dasherize(str)
      .split("-")
      .map((part) => this.capitalize(this.camelize(part)))
      .join(" ");
  }
}
