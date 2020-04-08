enum YamlType {
  array = 'array',
  string = 'string',
  multilines = 'multilines',
  boolean = 'boolean',
  number = 'number',
  null = 'null',
  object = 'object',
};

export class JSToYamlResult {
  value?: string;
  error?: Error;
}

export default class JSToYaml {
  public static spacing: string = '  ';
  public static spacingStart: string = '';

  public static stringify(data: any): JSToYamlResult {
    const type = this.getType(data);
    switch (type) {
      case YamlType.boolean:
      case YamlType.multilines:
      case YamlType.null:
      case YamlType.number:
      case YamlType.string:
        return {
          error: new Error('Must be an object or an array')
        };
    }

    const ret: string[] = [];
    this.convert(data, type, ret);
    return {
      value: ret.map(s => this.spacingStart + s).join('\n')
    };
  }

  private static isNumeric(str: any): boolean {
    if (typeof str != "string") {
      return false;
    }
    return !isNaN(str as any) && !isNaN(parseFloat(str));
  }

  private static convert(data: any, dataType: YamlType, arr: string[]): void {
    switch (dataType) {
      case YamlType.array:
        this.convertArray(data, arr);
        break;
      case YamlType.object:
        this.convertHash(data, arr);
        break;
      case YamlType.string:
        if (data.match(/\s/) || data.match(/^\{/) || this.isNumeric(data)) {
          arr.push(this.normalizeString(data));
        } else {
          arr.push(`${data}`);
        }
        break;
      case YamlType.multilines:
        data.split('\n').forEach((s: string) => {
          arr.push(s);
        });
        break;
      case YamlType.null:
        arr.push('null');
        break;
      case YamlType.number:
        arr.push(data.toString());
        break;
      case YamlType.boolean:
        arr.push(data ? 'true' : 'false');
        break;
    }
  }

  private static convertArray(data: any[], arr: string[]): void {
    if (data.length === 0) {
      arr.push('[]');
    }
    data.forEach((o: any) => {
      const arrItems = [] as string[];
      const type: YamlType = this.getType(o);
      this.convert(o, type, arrItems);
      switch (type) {
        case YamlType.string:
        case YamlType.null:
        case YamlType.number:
        case YamlType.boolean:
          arr.push(`- ${arrItems[0]}`);
          break;
        case YamlType.multilines:
          arr.push(`- |-`);
          arrItems.forEach((s) => {
            arr.push(this.spacing + s);
          });
          break;
        default:
          arr.push('- ');
          arrItems.forEach((d: string) => {
            arr.push(`${this.spacing}${d}`);
          });
          break;
      }
    });
  }

  private static convertHash(data: any, arr: string[]): void {
    for (const k of Object.keys(data)) {
      if (data.hasOwnProperty(k)) {
        const arrItems = [] as string[];
        const ele = data[k] as any;
        const type: YamlType = this.getType(ele);
        this.convert(ele, type, arrItems);
        switch (type) {
          case YamlType.string:
          case YamlType.null:
          case YamlType.number:
          case YamlType.boolean:
            arr.push(`${this.normalizeString(k)}: ${arrItems[0]}`);
            break;
          case YamlType.multilines:
            arr.push(`${this.normalizeString(k)}: |-`);
            arrItems.forEach((s) => {
              arr.push(this.spacing + s);
            });
            break;
          default:
            arr.push(this.normalizeString(k) + ': ');
            arrItems.forEach((d: string) => {
              arr.push(`${this.spacing}${d}`);
            });
            break;
        }
      }
    }
  }

  private static normalizeString(str: string): string {
    return `"${str.split('"').join('\\"')}"`;
  }

  private static getType(data: any): YamlType {
    const type: string = typeof (data);
    if (data === null) {
      return YamlType.null;
    }
    if (data instanceof Array) {
      return YamlType.array;
    }
    switch (type) {
      case 'string':
        if (data.indexOf('\n') > -1) {
          return YamlType.multilines;
        }
        return YamlType.string;
      case 'boolean':
        return YamlType.boolean;
      case 'number':
        return YamlType.number;
      case 'undefined':
        return YamlType.null;
      default:
        return YamlType.object;
    }
  }
}
