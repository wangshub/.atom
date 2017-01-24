var rocambole = require('rocambole');
var flatten   = require('array-flatten');

var alignedNodes = [];
var opts         = {
  ObjectExpression:     1,
  VariableDeclaration:  1,
  AssignmentExpression: 1,
  TernaryExpression:    0,
  OrExpression:         0,
  SpreadAlignment:      'key',
  ShorthandAlignment:   'key'
};

exports.setOptions = function(options) {
  Object.assign(opts, options.align);
  alignedNodes = [];
};

exports.transform = function(ast) {
  rocambole.walk(ast, function(node) {

    if (alignedNodes.indexOf(node) !== -1) return;

    if (opts.ObjectExpression && isObjectExpression(node)) {
      alignObjectExpression(node);
    }

    if (opts.VariableDeclaration && isVariableDeclaration(node)) {
      alignVariableDeclaration(node);
    }

    if (opts.AssignmentExpression && isExpressionStatement(node) && isAssignmentExpression(node.expression)) {
      alignAssignmentExpression(node);
    }

    if (opts.TernaryExpression && isExpressionStatement(node) && isConditionalExpression(node.expression)) {
      alignTernaryCondition(node);
      alignTernaryResult(node);
    }

    if (opts.OrExpression && isExpressionStatement(node) && isLogicalOrExpression(node.expression)) {
      alignLogicalOrExpression(node);
    }
  });
};

function alignObjectExpression(node) {
  var tokens = node.properties.map(function(property) {
    return property.value.startToken;
  });
  align(tokens);
}

function alignVariableDeclaration(node) {

  var nodes = getNext(node, isVariableDeclaration);

  alignedNodes = alignedNodes.concat(nodes);

  var tokens = flatten(nodes.map(function(node) {
    return node.declarations
      .map(function(declaraction) {
        return findNextInLine(declaraction.startToken, isEqualPunctuator);
      })
      .filter(truthy);
  }));

  align(tokens);

}

function alignAssignmentExpression(node) {
  var nodes = getNext(node, function(node) {
    return isExpressionStatement(node) && isAssignmentExpression(node.expression);
  });

  alignedNodes = alignedNodes.concat(nodes);

  var tokens = nodes
    .map(function(node) {
      return findNextInLine(node.expression.left.startToken, isEqualPunctuator);
    })
    .filter(truthy);

  align(tokens);
}

function alignLogicalOrExpression(node) {
  var nodes = getNext(node, function(node) {
    return isExpressionStatement(node) && isLogicalOrExpression(node.expression);
  });

  alignedNodes = alignedNodes.concat(nodes);
  var tokens = nodes
    .map(function(node) {
      return findAllInLine(node.expression.left.startToken, isLogicalOrPunctuator);
    })
    .filter(truthy);

  var tokensByOccurance = groupByOccuranceIndex(tokens);
  tokensByOccurance.forEach(function(tokens) {
    align(tokens);
  });

}

function alignTernaryCondition(node) {
  var nodes = getNext(node, function(node) {
    return isExpressionStatement(node) && isConditionalExpression(node.expression);
  });

  alignedNodes = alignedNodes.concat(nodes);

  var tokens = nodes
    .map(function(node) {
      return findNextInLine(node.expression.test.startToken, isTernaryConditionPunctuator);
    })
    .filter(truthy);

  align(tokens);
}

function alignTernaryResult(node) {
  var nodes = getNext(node, function(node) {
    return isExpressionStatement(node) && isConditionalExpression(node.expression);
  });

  alignedNodes = alignedNodes.concat(nodes);

  var tokens = nodes
    .map(function(node) {
      return findNextInLine(node.expression.consequent.startToken, isTernaryResultPunctuator);
    })
    .filter(truthy);

  align(tokens);
}

function align(tokens) {
  groupConsecutive(tokens).forEach(alignTokens);
}

function groupConsecutive(tokens) {
  var groups = [];
  var group  = [];
  var last   = undefined;
  tokens.forEach(function(token) {
    var line = getTokenLine(token);
    if (!last || line == last + 1) {
      group.push(token);
    } else {
      groups.push(group);
      group = [token];
    }
    last = line;
  });
  if (group.length) groups.push(group);
  return groups;
}

function groupByOccuranceIndex(tokenLines) {
  var tokensGrouped = [];
  var lengths       = tokenLines.map(function(tokenLines) {
    return tokenLines.length;
  });
  var maxLength = Math.max.apply(Math, lengths);
  for (var i = 0; i < maxLength; i++) {
    tokensGrouped[i] = [];
    tokenLines.forEach(function(tokens) {
      tokensGrouped[i].push(tokens[i]);
    });
  }
  return tokensGrouped;
}

function alignTokens(tokens) {
  var alignToCol = Math.max.apply(Math, tokens.map(getMinTokenColumn));
  tokens.forEach(function(token) {
    if (isWhiteSpace(token.prev)) {
      token.prev.value.replace(/ *$/, '');
    }
    var alignDiff = alignToCol - getMinTokenColumn(token);
    if (isSpreadPunctuator(token.prev)) {
      if (opts.SpreadAlignment === 'value') {
        token.prev.prev.value += repeat(' ', alignDiff);
      }
    } else if (isShorthandProperty(token)) {
      if (opts.ShorthandAlignment === 'value') {
        token.prev.value += repeat(' ', alignDiff);
      }
    } else {
      token.prev.value += repeat(' ', alignDiff);
    }
  });
}

function getMinTokenColumn(token) {
  var lineFirst = findPrevious(token.prev, isFirstOfLine);
  var pos       = 0;
  for (var t = lineFirst; t !== token; t = t.next) {
    if (isWhiteSpace(t) && t == token.prev) {
      pos += 1;
    } else if (isSpreadPunctuator(t)) {
      if (opts.SpreadAlignment === 'key') {
        pos += t.value.length;
      }
    } else  {
      pos += t.value.length;
    }
  }
  return pos;
}

function getTokenLine(token) {
  var line = 0;
  while (!isFirst(token)) {
    token = token.prev;
    if (isLineBreak(token)) {
      line++;
    }
  }
  return line;
}

function getNext(node, callback) {
  var nodes = [];
  while (node && callback(node)) {
    nodes.push(node);
    node = node.next;
  }
  return nodes;
}

function findPrevious(token, callback) {
  while (token) {
    if (callback(token)) return token;
    token = token.prev;
  }
}

function findNextInLine(token, callback) {
  while (token && !isLineBreak(token)) {
    if (callback(token)) return token;
    token = token.next;
  }
}

function findAllInLine(token, callback) {
  var nodes = [];
  while (token && !isLineBreak(token)) {
    if (!callback || callback(token)) {
      nodes.push(token);
    }
    token = token.next;
  }
  return nodes;
}

function isShorthandProperty(token) {
  var count = 0;
  while (!isFirstOfLine(token)) {
    if (isWhiteSpace(token)) {
      count++;
    }
    token = token.prev;
  }
  return count === 0;
}

function isIdentifier(token) {
  return token.type == 'Identifier';
}

function isFirstOfLine(token) {
  return isFirst(token) || isLineBreak(token.prev);
}

function isLineBreak(token) {
  return token.type == 'LineBreak';
}

function isWhiteSpace(token) {
  return token.type == 'WhiteSpace';
}

function isFirst(token) {
  return !token.prev;
}

function isEqualPunctuator(token) {
  return token.type == 'Punctuator' && token.value == '=';
}

function isTernaryConditionPunctuator(token) {
  return token.type == 'Punctuator' && token.value == '?';
}

function isTernaryResultPunctuator(token) {
  return token.type == 'Punctuator' && token.value == ':';
}

function isLogicalOrPunctuator(token) {
  return token.type == 'Punctuator' && token.value == '||';
}

function isSpreadPunctuator(token) {
  return token.type == 'Punctuator' && token.value == '...';
}

function truthy(v) {
  return !!v;
}

function isVariableDeclaration(node) {
  return node.type === 'VariableDeclaration';
}

function isExpressionStatement(node) {
  return node.type === 'ExpressionStatement';
}

function isAssignmentExpression(node) {
  return node.type === 'AssignmentExpression';
}

function isObjectExpression(node) {
  return node.type === 'ObjectExpression';
}

function isConditionalExpression(node) {
  return node.type === 'ConditionalExpression';
}

function isLogicalOrExpression(node) {
  return node.type === 'LogicalExpression' && node.operator == '||';
}

function repeat(str, n) {
  return new Array(n + 1).join(str);
}
