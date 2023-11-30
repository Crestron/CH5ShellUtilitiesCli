// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement 
// under which you licensed this source code.
/*global CrComLib */

const utilsModule = (() => {
  "use strict";

  const allowLogging = false; // Set this to true for manual debugging

  function log(...input) {
    if (allowLogging === true) {
      console.log(...input);
    }
  }

  /**
   * Merge the object into the target object
   * @param  {...any} args 
   */
  function mergeJSON(...args) {
    let target = {};
    // Loop through each object and conduct a merge
    for (let i = 0; i < args.length; i++) {
      target = merger(target, args[i]);
    }
    return target;
  }

  function merger(target, obj) {
    for (let prop in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          target[prop] = mergeJSON(target[prop], obj[prop]);
        } else {
          // Otherwise, do a regular merge
          target[prop] = obj[prop];
        }
      }
    }
    return target;
  }

  function dynamicSort(order, ...property) {
    let sort_order = 1;
    if (order === "desc") {
      sort_order = -1;
    }
    return function (a, b) {
      if (property.length > 1) {
        let propA = a[property[0]];
        let propB = b[property[0]];
        for (let i = 1; i < property.length; i++) {
          propA = propA[property[i]];
          propB = propB[property[i]];
        }
        // a should come before b in the sorted order
        if (propA < propB) {
          return -1 * sort_order;
          // a should come after b in the sorted order
        } else if (propA > propB) {
          return 1 * sort_order;
          // a and b are the same
        } else {
          return 0 * sort_order;
        }
      } else {
        // a should come before b in the sorted order
        if (a[property] < b[property]) {
          return -1 * sort_order;
          // a should come after b in the sorted order
        } else if (a[property] > b[property]) {
          return 1 * sort_order;
          // a and b are the same
        } else {
          return 0 * sort_order;
        }
      }
    }
  }

  /**
   * Is object empty
   * @param {object} input 
   */
  function isValidInput(input) {
    if (typeof input === 'number') {
      return true;
    } else if (typeof input === 'string') {
      if (input && input.trim() !== "") {
        return true;
      } else {
        return false;
      }
    } else if (typeof input === 'boolean') {
      return true;
    } else if (typeof input === 'object') {
      if (input) {
        return true;
      } else {
        return false;
      }
    } else if (typeof input === 'undefined') {
      return false;
    } else {
      return false;
    }
  }

  /**
   * Check whether object exists
   * @param {object} input 
   */
  function isValidObject(input) {
    if (!input || Object.keys(input).length === 0 || !isValidInput(input)) {
      return false;
    } else {
      return true;
    }
  }

  /*
   * Get an object value from a specific path
   * @param  {Object}       obj  The object
   * @param  {String|Array} path The path
   * @param  {*}            def  A default value to return [optional]
   * @return {*}                 The value
   */
  function getContent(obj, path, def) {
    /**
     * If the path is a string, convert it to an array
     * @param  {String|Array} path The path
     * @return {Array}             The path array
     */
    const stringToPath = function (path) {
      // If the path isn't a string, return it
      if (typeof path !== 'string') {
        return path;
      } else {
        const output = [];
        path.split('.').forEach(function (item) {
          // Split to an array with bracket notation
          item.split(/\[([^}]+)\]/g).forEach(function (key) {
            // Push to the new array
            if (key.length > 0) {
              output.push(key);
            }
          });
        });
        return output;
      }
    };

    // Get the path as an array
    path = stringToPath(path);

    // Cache the current object
    let current = obj;

    // For each item in the path, dig into the object
    for (let i = 0; i < path.length; i++) {
      // If the item isn't found, return the default (or null)
      if (!current[path[i]]) return def;
      // Otherwise, update the current  value
      current = current[path[i]];
    }
    return current;
  }

  /*
   * Replaces placeholders with real content
   * @param {String} template The template string
   * @param {String} local    A local placeholder to use, if any
   */
  function replacePlaceHolders(template, data) {
    // Check if the template is a string or a function
    template = typeof (template) === 'function' ? template() : template;
    if (['string', 'number'].indexOf(typeof template) === -1) throw 'Please provide a valid template';
    // If no data, return template as-is
    if (!data) return template;
    // Replace our curly braces with data
    template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {
      // Remove the wrapping curly braces
      match = match.slice(2, -2);
      // Get the value
      const val = getContent(data, match.trim());
      // Replace
      if (!val) return '{{' + match + '}}';
      return val;
    });
    return template;
  }

  return {
    log,
    dynamicSort,
    isValidObject,
    isValidInput,
    mergeJSON,
    replacePlaceHolders
  };
})();
