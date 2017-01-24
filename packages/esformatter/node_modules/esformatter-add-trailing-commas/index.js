'use strict';

var rocambole = require('rocambole');
var tk = require('rocambole-token');

function findLastElement(token) {
  if (!token) {
    return null;
  }

  if (token.type === 'Punctuator' && token.value.match(/\[|\{/)) {
    return null;
  }

  if (tk.isBr(token) || tk.isWs(token) || tk.isIndent(token) || tk.isComment(token)) {
    return findLastElement(token.prev);
  }

  return token;
}

function hasPrecedingNewline(token) {
  if (!token) {
    return false;
  }

  if (tk.isBr(token)) {
    return true;
  }

  if (tk.isWs(token) || tk.isIndent(token)) {
    return hasPrecedingNewline(token.prev);
  }

  return false;
}

function addComma(expToken) {
  if (!expToken || !expToken.type.match(/ArrayExpression|ObjectExpression/)) {
    return;
  }

  var token = expToken.endToken;

  if (!hasPrecedingNewline(token.prev)) {
    return;
  }

  var lastElement = findLastElement(token.prev);
  if (!lastElement) {
    return;
  }

  if (lastElement.value === ',') {
    return;
  }

  tk.after(lastElement, {
    value: ',',
  });
}

module.exports = {
  transformAfter: function transformAfter(ast) {
    rocambole.recursive(ast, addComma);
  },
};
