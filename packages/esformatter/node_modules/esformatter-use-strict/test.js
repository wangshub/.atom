// eslint-disable-next-line
'use strict';

const assert = require('assert');

const mocha = require('mocha');
const esformatter = require('esformatter');

const useStrictPlugin = require('./');

esformatter.register(useStrictPlugin);

mocha.describe('use strict plugin', () => {
	mocha.it('should add use strict to top of module.', () => {
		// Given.
		const codeStr = 'function MyClass() {}';

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, "'use strict';\n\nfunction MyClass() {\n}");
	});

	mocha.it('should remove other use strict pragmas.', () => {
		// Given.
		const codeStr = "function MyClass() {'use strict';}";

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, "'use strict';\n\nfunction MyClass() {\n}");
	});

	mocha.it('should remove other use strict pragmas in double quotes.', () => {
		// Given.
		const codeStr = 'function MyClass() {"use strict";\nconst t = 10;}';

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, "'use strict';\n\nfunction MyClass() {\n  const t = 10;\n}");
	});

	mocha.it('should remove extra trailing new lines after use strict pragmas.', () => {
		// Given.
		const codeStr = 'function MyClass() {"use strict";\n\nconst t = 10;}';

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then.
		assert.equal(formattedCode, "'use strict';\n\nfunction MyClass() {\n  const t = 10;\n}");
	});

	mocha.it('should remove spacing newline after use strict pragma line.', () => {
		// Given.
		const codeStr = '"use strict";\n\n/**/';

		// When.
		const formattedCode = esformatter.format(codeStr);

		// Then - if we didn't remove the spacing newline we would end up with three \n.
		assert.equal(formattedCode, "'use strict';\n\n/**/");
	});

	mocha.it('should use double quotes if configured.', () => {
		// Given.
		const codeStr = '"use strict";\n\n/**/';

		// When.
		const formattedCode = esformatter.format(codeStr, {
			quotes: {
				type: 'double'
			}
		});

		// Then - `use strict` is surrounded by double quotes.
		assert.equal(formattedCode, '"use strict";\n\n/**/');
	});
});
