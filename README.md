# JSToYaml

A small tool for converting JS Object/Array into YAML.
https://www.npmjs.com/package/convert-yaml

## Installation

```
$ npm install convert-yaml --save
```

## Participate
Build: 
```
$ npm run build
$ npm publish
```

## Usage

```
import JSToYaml from 'convert-yaml';
const text: string = JSToYaml.stringify(myObjectToConvert).value;
```