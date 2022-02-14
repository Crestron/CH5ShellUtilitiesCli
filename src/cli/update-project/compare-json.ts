export class CompareJSON {

  private readonly VALUE_CREATED: string = 'created';
  private readonly VALUE_UPDATED: string = 'updated';
  private readonly VALUE_DELETED: string = 'deleted';
  private readonly VALUE_UNCHANGED: string = 'unchanged';

  public map(obj1: any, obj2: any) {
    if (this.isFunction(obj1) || this.isFunction(obj2)) {
      throw 'Invalid argument. Function given, object expected.';
    }

    const diff: any = {};
    if (this.isValue(obj1) || this.isValue(obj2)) {
      return {
        type: this.compareValues(obj1, obj2),
        data: obj1 === undefined ? obj2 : obj1
      };
    }

    for (const key in obj1) {
      if (this.isFunction(obj1[key])) {
        continue;
      }
      let value2 = undefined;
      if (obj2[key] !== undefined) {
        value2 = obj2[key];
      }
      diff[key] = this.map(obj1[key], value2);
    }

    for (const key in obj2) {
      if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
        continue;
      }
      diff[key] = this.map(undefined, obj2[key]);
    }

    return diff;
  }

  private compareValues(value1: any, value2: any) {
    if (value1 === value2) {
      return this.VALUE_UNCHANGED;
    }
    if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
      return this.VALUE_UNCHANGED;
    }
    if (value1 === undefined) {
      return this.VALUE_CREATED;
    }
    if (value2 === undefined) {
      return this.VALUE_DELETED;
    }
    return this.VALUE_UPDATED;
  }

  private isFunction(input: any) {
    return Object.prototype.toString.call(input) === '[object Function]';
  }

  private isArray(input: any) {
    return Object.prototype.toString.call(input) === '[object Array]';
  }

  private isDate(input: any) {
    return Object.prototype.toString.call(input) === '[object Date]';
  }

  private isObject(input: any) {
    return Object.prototype.toString.call(input) === '[object Object]';
  }

  private isValue(input: any) {
    return !this.isObject(input) && !this.isArray(input);
  }

}
