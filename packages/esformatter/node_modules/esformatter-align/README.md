# esformatter-align

[esformatter](https://github.com/millermedeiros/esformatter) plugin for alignment.



## Usage

install it:

```sh
npm install esformatter-align
```

and add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-align"
  ]
}
```

## Alignments

### VariableDeclarations

input:

```js
var longer = require('hello');
var small = require('hello');
var muchlonger = require('hello');
```

output:

```js
var longer     = require('hello');
var small      = require('hello');
var muchlonger = require('hello');
```

### ObjectExpressions

input:

```js
var x = {
  a: 5,
  bla: ''
};
```

output:

```js
var x = {
  a:   5,
  bla: ''
};
```

### AssignmentExpressions

input:

```js
foo = 'bar';
fooooooo = 'baz';
```

output:

```js
foo      = 'bar';
fooooooo = 'baz';
```

### TernaryExpression

input:

```js
foo ? x : 'bar';
fooooooo ? y : 'baz';
```

output:

```js
foo      ? x : 'bar';
fooooooo ? y : 'baz';
```

### OrExpression

input:

```js
foo || x || 'bar';
fooooooo || yy || 'baz';
```

output:

```js
foo      || x  || 'bar';
fooooooo || yy || 'baz';
```

### SpreadAlignment, ShorthandAlignment

The object spread operator and shorthand can either be aligned with
the keys (default) or with the values.

input:

```js
var y = { blu: 1 };
var z = true;
var x = {
z,
    ...y,
 bla: 5
};

```

output (default: keys):

```js
var y = {
  blu: 1
};
var x = {
  z,
  ...y,
  bla: 5
};

```

output (option: value):

```js
var y = {
  blu: 1
};
var x = {
       z,
       ...y,
  bla: 5
};

```


## Config

Optionally disable alignment of specific expressions
and set some other options

```js
{
  "esformatter": {
    // ...
  },
  "indent": {
    // ...
  },
  "align": {
    "ObjectExpression":     1,
    "VariableDeclaration":  1,
    "AssignmentExpression": 1,
    "TernaryExpression":    0,
    "OrExpression":         0,
    "SpreadAlignment":      "key", // optional: "value"
    "ShorthandAlignment":   "key"  // optional: "value"
  },
  // ...
}
```

## License

Released under the [MIT License](http://opensource.org/licenses/MIT).

