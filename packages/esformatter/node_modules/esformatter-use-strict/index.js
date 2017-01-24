// eslint-disable-next-line
'use strict';

const rocamboleToken = require('rocambole-token');

let quoteValue = "'";

exports.setOptions = function setOptions(opts) {
	const quoteType = opts && opts.quotes && opts.quotes.type;

	if (quoteType && quoteType === 'double') {
		quoteValue = '"';
	}
};

exports.stringAfter = function stringAfter(formattedString) {
	let trailingLineBreaks = '\n\n';
	const firstCharacterIsNewline = formattedString.charAt(0) === '\n';
	const secondCharacterIsNewline = formattedString.charAt(1) === '\n';

	// If the module starts with newlines there is no need to add any after pragma
	if (firstCharacterIsNewline && secondCharacterIsNewline) {
		trailingLineBreaks = '';
	} else if (firstCharacterIsNewline) {
		trailingLineBreaks = '\n';
	}

	return `${quoteValue}use strict${quoteValue};${trailingLineBreaks}${formattedString}`;
};

exports.tokenBefore = function tokenBefore(token) {
	if (isUseStrictPragma(token)) {
		// Remove possible semicolon after 'use strict'
		if (rocamboleToken.isSemiColon(token.next)) {
			rocamboleToken.remove(token.next);
		}

		// Remove possible newline at end of 'use strict';
		if (rocamboleToken.isBr(token.next)) {
			rocamboleToken.remove(token.next);
		}

		rocamboleToken.remove(token);
	}
};

function isUseStrictPragma(token) {
	return token.type === 'String' && (token.value === "'use strict'" || token.value === '"use strict"');
}
