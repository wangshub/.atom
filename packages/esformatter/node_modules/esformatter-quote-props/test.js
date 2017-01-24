const assert = require('assert');

const mocha = require('mocha');
const esformatter = require('esformatter');

const quotePropsPlugin = require('./');

esformatter.register(quotePropsPlugin);

mocha.describe('quote props plugin', () => {
	mocha.it('should remove quotes around properties', () => {
		// Given.
		const codeStr = "const obj = {\
			'dropDown': 'setField'\
		}";

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, 'const obj = {\n' +
			"  dropDown: 'setField'\n" +
		'}');
	});

	mocha.it('should remove quotes in compound data', () => {
		// Given.
		const codeStr = "const obj = {\
			'dropDown': 'setField',\
			'button': 'clickButton',\
			'field': 'setField',\
			'fields': 'setField',\
			'hybridField': 'setField',\
			'state': 'setState'\
		}";

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, 'const obj = {\n' +
			"  dropDown: 'setField',\n" +
			"  button: 'clickButton',\n" +
			"  field: 'setField',\n" +
			"  fields: 'setField',\n" +
			"  hybridField: 'setField',\n" +
			"  state: 'setState'\n" +
		'}');
	});

	mocha.it('should remove quotes in mixed compound data', () => {
		// Given.
		const codeStr = "const t = {\
			'subject': subject,\
			data: null,\
            777: true\
		};";

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, 'const t = {\n' +
			'  subject: subject,\n' +
			'  data: null,\n' +
            '  777: true\n' +
		'};');
	});

	mocha.it('should handle null computed properties', () => {
		// Given.
		const codeStr = 'const data = {\
			[null]: {}\
		};';

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, 'const data = {\n' +
			'  [null]: {}\n' +
		'};');
	});
});
