const unquotedValidator = require('unquoted-property-validator');

module.exports.nodeBefore = function nodeBefore(node) {
	if (isQuotedProperty(node) && isSafeToUnquote(node)) {
		unquoteProperty(node);
	}
};

function isQuotedProperty(node) {
	return node.type === 'Literal' && node.parent.type === 'Property' && node.parent.key === node;
}

function isSafeToUnquote(node) {
	const nodeValue = String(node.value);
	const results = unquotedValidator(nodeValue);

	return results.needsQuotes === false;
}

function unquoteProperty(node) {
	const block = {
		name: node.value,
		range: node.range,
		type: 'Identifier',
		parent: node.parent,
		endToken: node.endToken,
		startToken: node.startToken
	};

	node.startToken.type = 'Identifier';
	node.startToken.value = node.value;
	node.parent.key = block;
}
