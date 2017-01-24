# esformatter-add-trailing-commas [![Build Status](https://travis-ci.org/deoxxa/esformatter-add-trailing-commas.svg?branch=master)](https://travis-ci.org/deoxxa/esformatter-add-trailing-commas)

[esformatter](https://github.com/millermedeiros/esformatter) plugin that adds trailing commas.

```js
var foo = {
  a: 1
};

// converted to:
var foo = {
  a: 1,
};
```

## Install

With [npm](http://npmjs.org) do:

```bash
$ npm i esformatter-add-trailing-commas
```

## Usage

esformatter config file:

```json
{
  "plugins": [
    "esformatter-add-trailing-commas"
  ]
}
```

## License

MIT
